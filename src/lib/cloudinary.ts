/**
 * Upload an image file to Cloudinary and return the secure URL.
 * @param file Image file to upload
 * @returns Promise<string> Secure URL of the uploaded image
 * @throws Error if file is not an image or upload fails
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
        console.error("Invalid file type:", file.type);
        throw new Error("Only image files are allowed");
    }

    // Debug info: environment variables and file details
    console.log(
        "[Cloudinary] Uploading with:",
        "Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        "Preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    console.log("[Cloudinary] File info:", file.name, file.size, file.type);

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
        // Make POST request to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: formData }
        );

        // Handle response errors
        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Cloudinary] Response error:", errorText);
            console.error("[Cloudinary] Status:", response.status, response.statusText);
            throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
        }

        // Parse JSON response
        const data = await response.json();
        console.log("[Cloudinary] Upload successful:", data.secure_url);
        return data.secure_url;

    } catch (err) {
        console.error("[Cloudinary] Upload failed:", err);
        throw err;
    }
};
