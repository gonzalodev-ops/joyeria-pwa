# Rate Limiting para Supabase Edge Functions

Este documento describe la implementación de rate limiting para proteger las Edge Functions de abuso y controlar costos de API.

## 1. Estrategia de Rate Limiting para SaaS

### Contexto del Negocio
- **Modelo:** SaaS para joyerías
- **Uso típico:** 200-300 imágenes/día por cliente
- **Patrón:** Procesamiento por lotes (batch processing)
- **Objetivo:** Balance entre protección y UX fluida

### Límites Propuestos (Orientados a SaaS)

#### Por Usuario Autenticado (Recomendado)

| Plan | Imágenes/Día | Burst Rate* | Procesamiento Concurrente | Precio Sugerido |
|------|--------------|-------------|---------------------------|-----------------|
| **Free Trial** | 50 | 10/min | 2 simultáneas | $0 |
| **Starter** | 300 | 30/min | 5 simultáneas | $29/mes |
| **Professional** | 1000 | 60/min | 10 simultáneas | $99/mes |
| **Enterprise** | Ilimitado | 120/min | 20 simultáneas | Custom |

*Burst Rate = Pico máximo de requests por minuto

#### Por IP (Sin Autenticación - Fallback)

| Endpoint | Límite por IP | Ventana | Propósito |
|----------|---------------|---------|-----------|
| `/analyze-image` | 100 requests | 1 hora | Prevenir abuso anónimo |
| `/remove-background` | 100 requests | 1 hora | Prevenir abuso anónimo |
| `/batch-process` | 10 batches | 1 hora | Limitar lotes grandes |

### Arquitectura Recomendada: Sistema de Colas

Para procesamiento por lotes eficiente:

```
Usuario sube 50 imágenes
         ↓
    [Frontend]
         ↓
  Crea Job en Cola
         ↓
    [Supabase]
    jobs table
         ↓
  [Background Worker]
  (Edge Function + Cron)
         ↓
  Procesa 5 a la vez
  (rate limit interno)
         ↓
   Actualiza progreso
         ↓
  Usuario ve dashboard
  "Procesando 30/50..."
```

## 2. Implementación con Upstash Redis

### 2.1 Setup de Upstash

1. **Crear cuenta en Upstash**
   - Visitar: https://upstash.com/
   - Plan gratuito: 10,000 requests/día

2. **Crear Redis Database**
   ```bash
   # En Upstash Console
   - Nombre: joyeria-pwa-ratelimit
   - Región: us-east-1 (o más cercana)
   - TLS: Enabled
   ```

3. **Obtener credenciales**
   ```env
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```

### 2.2 Código de Rate Limiting

Crear archivo: `supabase/functions/_shared/rateLimit.ts`

```typescript
import { createClient } from 'https://esm.sh/@upstash/redis@1.25.1';

interface RateLimitConfig {
  limit: number;
  window: number; // en segundos
}

const redis = createClient({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
});

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - (config.window * 1000);

  try {
    // Usar Redis sorted set para tracking
    const pipeline = redis.pipeline();
    
    // Remover entradas antiguas
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Contar requests en la ventana actual
    pipeline.zcard(key);
    
    // Añadir request actual
    pipeline.zadd(key, { score: now, member: now.toString() });
    
    // Setear expiración
    pipeline.expire(key, config.window);
    
    const results = await pipeline.exec();
    const count = results[1] as number;

    const allowed = count < config.limit;
    const remaining = Math.max(0, config.limit - count - 1);
    const resetAt = now + (config.window * 1000);

    return { allowed, remaining, resetAt };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // En caso de error, permitir la request (fail open)
    return { allowed: true, remaining: config.limit, resetAt: now + (config.window * 1000) };
  }
}

export function getRateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };
}
```

### 2.3 Aplicar a Edge Functions

Actualizar `supabase/functions/analyze-image/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { checkRateLimit, getRateLimitHeaders } from '../_shared/rateLimit.ts';

const RATE_LIMIT_CONFIG = {
  limit: 10,
  window: 60, // 1 minuto
};

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Obtener IP del cliente
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      `analyze-image:${clientIP}`,
      RATE_LIMIT_CONFIG
    );

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            ...getRateLimitHeaders(rateLimitResult),
          },
        }
      );
    }

    // ... resto de la lógica de la función

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          ...getRateLimitHeaders(rateLimitResult),
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
```

## 3. Alternativa: Rate Limiting sin Upstash

Si no quieres usar Upstash, puedes implementar rate limiting básico con Supabase:

### 3.1 Crear tabla en Supabase

```sql
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_rate_limits_lookup ON rate_limits(identifier, endpoint, window_start);

-- Función para limpiar entradas antiguas (ejecutar cada hora)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Código de Rate Limiting con Supabase

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

export async function checkRateLimitSupabase(
  identifier: string,
  endpoint: string,
  limit: number,
  windowMinutes: number = 1
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  try {
    // Contar requests en la ventana actual
    const { data, error } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    const currentCount = data?.request_count || 0;
    const allowed = currentCount < limit;

    if (allowed) {
      // Incrementar contador o crear nueva entrada
      if (data) {
        await supabase
          .from('rate_limits')
          .update({ request_count: currentCount + 1 })
          .eq('identifier', identifier)
          .eq('endpoint', endpoint)
          .gte('window_start', windowStart.toISOString());
      } else {
        await supabase
          .from('rate_limits')
          .insert({
            identifier,
            endpoint,
            request_count: 1,
            window_start: new Date().toISOString(),
          });
      }
    }

    return {
      allowed,
      remaining: Math.max(0, limit - currentCount - 1),
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open en caso de error
    return { allowed: true, remaining: limit };
  }
}
```

## 4. Manejo en el Cliente

Actualizar `src/services/gemini.ts` para manejar rate limiting:

```typescript
import { logger, APIError } from '../lib/errors';

export async function analyzeImage(imageUrl: string) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ imageUrl }),
    });

    // Leer headers de rate limit
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const resetAt = response.headers.get('X-RateLimit-Reset');

    if (response.status === 429) {
      const data = await response.json();
      throw new APIError(
        'Rate limit exceeded',
        429,
        `Has excedido el límite de solicitudes. Intenta de nuevo después de ${new Date(data.resetAt).toLocaleTimeString()}.`,
        data
      );
    }

    // Log warning si quedan pocas requests
    if (remaining && parseInt(remaining) < 3) {
      logger.warn(`Rate limit casi alcanzado. Quedan ${remaining} requests.`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Error analyzing image', error);
    throw error;
  }
}
```

## 5. Deployment

### 5.1 Configurar Secrets en Supabase

```bash
# Si usas Upstash
supabase secrets set UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
supabase secrets set UPSTASH_REDIS_REST_TOKEN=xxx

# Deploy functions
supabase functions deploy analyze-image
supabase functions deploy remove-background
```

### 5.2 Testing

```bash
# Test rate limiting
for i in {1..15}; do
  curl -X POST https://xxx.supabase.co/functions/v1/analyze-image \
    -H "Authorization: Bearer xxx" \
    -H "Content-Type: application/json" \
    -d '{"imageUrl": "test"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 1
done
```

## 6. Monitoreo

### 6.1 Dashboard de Métricas

Crear vista en Supabase para monitorear uso:

```sql
CREATE VIEW rate_limit_stats AS
SELECT 
  endpoint,
  DATE_TRUNC('hour', window_start) as hour,
  COUNT(*) as total_requests,
  COUNT(DISTINCT identifier) as unique_users
FROM rate_limits
WHERE window_start > NOW() - INTERVAL '24 hours'
GROUP BY endpoint, hour
ORDER BY hour DESC;
```

### 6.2 Alertas

Configurar alertas en Supabase Dashboard para:
- Rate limit alcanzado frecuentemente
- Picos inusuales de tráfico
- Errores en Edge Functions

## 7. Próximos Pasos

- [ ] Implementar rate limiting por usuario autenticado (más generoso)
- [ ] Dashboard de uso para usuarios
- [ ] Sistema de créditos/cuotas
- [ ] Whitelist para IPs confiables
- [ ] Blacklist automática para abuso detectado

---

**Nota:** Por ahora, el rate limiting está documentado pero no implementado. Se recomienda implementarlo antes de lanzar a producción para controlar costos de API.
