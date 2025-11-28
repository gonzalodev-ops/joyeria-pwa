// PhotoRoom service for background removal

const PHOTOROOM_API_KEY = import.meta.env.VITE_PHOTOROOM_API_KEY;

export const removeBackground = async (imageFile: File): Promise<Blob> => {
    if (!PHOTOROOM_API_KEY) {
        throw new Error('Missing PhotoRoom API Key');
    }

    const formData = new FormData();
    formData.append('image_file', imageFile);

    const response = await fetch('https://sdk.photoroom.com/v1/segment', {
        method: 'POST',
        headers: {
            'x-api-key': PHOTOROOM_API_KEY,
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to remove background');
    }

    return await response.blob();
};
