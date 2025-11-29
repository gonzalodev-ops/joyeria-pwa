import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import type { JewelryMetadata } from '../services/gemini';

interface EditorState {
    selectedImage: File | null;
    processedImage: string | null;
    metadata: JewelryMetadata | null;
    isProcessing: boolean;
    isAnalyzing: boolean;
}

interface EditorContextType extends EditorState {
    setSelectedImage: (file: File | null) => void;
    setProcessedImage: (url: string | null) => void;
    setMetadata: (metadata: JewelryMetadata | null) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
    resetEditor: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<JewelryMetadata | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const resetEditor = useCallback(() => {
        setSelectedImage(null);
        setProcessedImage(null);
        setMetadata(null);
        setIsProcessing(false);
        setIsAnalyzing(false);
    }, []);

    const value = {
        selectedImage,
        processedImage,
        metadata,
        isProcessing,
        isAnalyzing,
        setSelectedImage,
        setProcessedImage,
        setMetadata,
        setIsProcessing,
        setIsAnalyzing,
        resetEditor
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
}

export function useEditor() {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
}
