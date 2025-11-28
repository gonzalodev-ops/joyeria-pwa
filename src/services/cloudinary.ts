// Cloudinary service for image upload and manipulation

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Missing Cloudinary configuration');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
};

export const uploadDataURLToCloudinary = async (dataURL: string): Promise<string> => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Missing Cloudinary configuration');
    }

    const formData = new FormData();
    formData.append('file', dataURL);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
};

export interface CloudinaryEnhancement {
    brightness: number;
    contrast: number;
    saturation: number;
    auto_enhance: boolean;
}

export const generateTransformationString = (enhancements: CloudinaryEnhancement): string => {
    const transforms = [];
    if (enhancements.auto_enhance) transforms.push('e_improve');
    if (enhancements.brightness !== 0) transforms.push(`e_brightness:${enhancements.brightness}`);
    if (enhancements.contrast !== 0) transforms.push(`e_contrast:${enhancements.contrast}`);
    if (enhancements.saturation !== 0) transforms.push(`e_saturation:${enhancements.saturation}`);
    return transforms.join(',');
};

export const applyTransformationsToUrl = (url: string, enhancements: CloudinaryEnhancement): string => {
    const transformationString = generateTransformationString(enhancements);
    if (!transformationString) return url;

    // Insert transformation string after "upload/"
    // Handles both http and https urls
    return url.replace('/upload/', `/upload/${transformationString}/`);
};

export const uploadWithEnhancement = async (dataURL: string, enhancements: CloudinaryEnhancement): Promise<string> => {
    // First upload the raw image
    const rawUrl = await uploadDataURLToCloudinary(dataURL);

    // Apply transformations to the URL
    return applyTransformationsToUrl(rawUrl, enhancements);
};
