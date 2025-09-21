export const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) {
        console.error("Invalid file type:", file.type);
        throw new Error("Only image files are allowed");
    }

    // Debugging environment variables
    console.log(
        "[Cloudinary] Uploading with:",
        "Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        "Preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    console.log("[Cloudinary] File info:", file.name, file.size, file.type);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Cloudinary] Response error:", errorText);
            console.error("[Cloudinary] Status:", response.status, response.statusText);
            throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[Cloudinary] Upload successful:", data.secure_url);
        return data.secure_url;

    } catch (err) {
        console.error("[Cloudinary] Upload failed:", err);
        throw err;
    }
};
