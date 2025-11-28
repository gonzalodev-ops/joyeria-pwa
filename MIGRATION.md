# Migración de Base de Datos para Ordenamiento de Catálogos

Para habilitar la funcionalidad de reordenar imágenes en los catálogos (Drag & Drop), necesitas agregar una columna `position` a la tabla `catalog_items`.

Por favor, ejecuta el siguiente comando SQL en el Editor SQL de tu dashboard de Supabase:

```sql
-- Agregar columna position
ALTER TABLE public.catalog_items ADD COLUMN position integer DEFAULT 0;

-- Crear una función para reordenar items (opcional pero recomendado para atomicidad)
CREATE OR REPLACE FUNCTION update_catalog_item_positions(updates jsonb)
RETURNS void AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE public.catalog_items
    SET position = (item->>'position')::int
    WHERE catalog_id = (item->>'catalog_id')::uuid
      AND image_id = (item->>'image_id')::uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```
