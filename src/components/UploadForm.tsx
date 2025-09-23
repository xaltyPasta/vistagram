import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * UploadForm component allows authenticated users to upload photos.
 * Supports gallery selection, camera capture, preview, caption, and submission.
 */
export default function UploadForm() {
    const { data: session } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [caption, setCaption] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isCamera, setIsCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    /** Start device camera for capturing photo */
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
            });
            setStream(mediaStream);
            setIsCamera(true);
        } catch {
            alert("Could not access camera. Check permissions.");
        }
    };

    // Play video stream when it becomes available
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
        }
    }, [stream]);

    /** Stop camera and release media tracks */
    const stopCamera = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsCamera(false);
    };

    /** Capture photo from video stream */
    const capturePhoto = () => {
        if (!videoRef.current) {
            alert("Video not ready yet. Please try again.");
            return;
        }

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    setSelectedFile(file);
                    setPreviewUrl(canvas.toDataURL());
                    stopCamera();
                }
            }, "image/jpeg", 0.8);
        }
    };

    /** Handle file selection from gallery */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = e => setPreviewUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    /** Submit the selected file to Cloudinary and create post */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !session) return;

        setIsUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(selectedFile);
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl, caption: caption.trim() || null }),
            });
            if (res.ok) router.reload();
            else throw new Error("Failed to create post");
        } catch {
            alert("Failed to upload post.");
        } finally {
            setIsUploading(false);
        }
    };

    /** Reset form to initial state */
    const resetForm = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setCaption("");
        stopCamera();
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Render sign-in prompt if user is not authenticated
    if (!session)
        return (
            <div className="card p-5 text-center">
                <h2 className="fw-bold mb-3">Sign in to upload</h2>
                <p className="text-muted">You need to be signed in to share your moments.</p>
            </div>
        );

    return (
        <div className="card p-4 mb-4">
            {/* File selection / camera options */}
            {!selectedFile && !isCamera && (
                <div className="text-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleFileSelect}
                    />
                    <div className="d-grid gap-3">
                        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                            Choose from Gallery
                        </button>
                        <button className="btn btn-success" onClick={startCamera}>
                            Take Photo
                        </button>
                    </div>
                </div>
            )}

            {/* Camera preview and controls */}
            {isCamera && (
                <div>
                    <div style={{ width: "100%", paddingBottom: "100%", position: "relative" }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "0.5rem",
                            }}
                        />
                    </div>
                    <div className="d-flex gap-2 mt-2">
                        <button className="btn btn-primary flex-fill" type="button" onClick={capturePhoto}>
                            Capture
                        </button>
                        <button className="btn btn-secondary flex-fill" type="button" onClick={stopCamera}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Image preview and caption form */}
            {selectedFile && previewUrl && (
                <form onSubmit={handleSubmit}>
                    <div style={{ width: "100%", paddingBottom: "100%", position: "relative", marginTop: "1rem" }}>
                        <Image src={previewUrl} alt="Preview" fill className="object-fit-cover rounded" />
                    </div>
                    <textarea
                        className="form-control mb-2 mt-2"
                        rows={3}
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                    />
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary flex-fill" type="submit" disabled={isUploading}>
                            {isUploading ? "Uploading..." : "Share Post"}
                        </button>
                        <button className="btn btn-secondary flex-fill" type="button" onClick={resetForm}>
                            Start Over
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
