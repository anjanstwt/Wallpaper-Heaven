import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { UPLOAD_IMAGE_URL } from '@/routes/routes';

export async function handleUpload(file: File): Promise<string | undefined> {
    if (!file) return undefined;

    // Safari/Mac HEIC files often have no type — catch early
    if (!file.type || !file.type.includes('/')) {
        toast.error("Unsupported file type. Please upload a JPEG, PNG, or WebP image.");
        return undefined;
    }

    let uploadUrl: string;
    let publicUrl: string;

    try {
        const { data } = await axios.post(
            UPLOAD_IMAGE_URL,
            { fileType: file.type }
        );
        uploadUrl = data.uploadUrl;
        publicUrl = data.publicUrl;
        if (!uploadUrl) {
            toast.error("Failed to get upload URL from server.");
            return undefined;
        }
    } catch (err) {
        const axErr = err as AxiosError<{ message?: string }>;
        const msg = axErr.response?.data?.message || axErr.message || "Unknown error";
        toast.error(`Upload auth failed: ${msg}`);
        console.error('Error getting presigned URL:', err);
        return undefined;
    }

    try {
        await axios.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            timeout: 30000,
        });
    } catch (err) {
        const axErr = err as AxiosError;
        // Network error with no response almost always means S3 CORS is not configured
        if (!axErr.response) {
            toast.error("Image upload blocked — S3 CORS not configured. See console for details.");
            console.error(
                "S3 CORS error: Add a CORS policy to your S3 bucket (wallpaper-heaven) in AWS Console → S3 → Permissions → CORS.\n",
                'Example:\n[{"AllowedHeaders":["*"],"AllowedMethods":["PUT","GET"],"AllowedOrigins":["*"],"ExposeHeaders":[]}]'
            );
        } else {
            toast.error(`S3 upload failed (${axErr.response.status}): ${axErr.response.statusText}`);
        }
        console.error('Error uploading to S3:', err);
        return undefined;
    }

    return publicUrl;
}
