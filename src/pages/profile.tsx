import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function ProfilePage() {
    const { data: session } = useSession();

    const [name, setName] = useState(session?.user?.name || "");
    const [image, setImage] = useState(session?.user?.image || "");
    const [bio, setBio] = useState(session?.user?.bio || "");

    const [editMode, setEditMode] = useState({
        name: false,
        image: false,
        bio: false,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    /** Handle Cloudinary image upload */
    const handleImageUpload = async (file: File) => {
        setLoading(true);
        try {
            const uploadedUrl = await uploadToCloudinary(file);
            setImage(uploadedUrl);
            setMessage("✅ Image uploaded successfully!");
        } catch (err) {
            console.error(err);
            setMessage("❌ Image upload failed!");
        } finally {
            setLoading(false);
        }
    };

    /** Trigger hidden file input */
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };

    /** Submit updated profile */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const res = await fetch("/api/profile/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, image, bio }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            setMessage("✅ Profile updated successfully!");
            setEditMode({ name: false, image: false, bio: false });
        } else {
            setMessage(`❌ ${data.error || "Update failed"}`);
        }
    };

    return (
        <Layout title="Edit Profile - Vistagram">
            <div className="container my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h1 className="card-title mb-4">Profile</h1>
                                <form onSubmit={handleSubmit}>

                                    {/* Name Field */}
                                    <div className="mb-3 d-flex align-items-center">
                                        <label htmlFor="name" className="form-label me-2 flex-grow-1">
                                            Name
                                        </label>
                                        {editMode.name ? (
                                            <input
                                                id="name"
                                                className="form-control"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        ) : (
                                            <span className="flex-grow-1">{name}</span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-link"
                                            onClick={() =>
                                                setEditMode((prev) => ({ ...prev, name: !prev.name }))
                                            }
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                    </div>

                                    {/* Profile Image */}
                                    <div className="mb-3 d-flex align-items-center">
                                        <label className="form-label me-2 flex-grow-1">Profile Image</label>
                                        <div className="d-flex align-items-center gap-2">
                                            <img
                                                src={image || "/default-avatar.png"}
                                                alt="Profile"
                                                width={60}
                                                height={60}
                                                className="rounded-circle"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => editMode.image && triggerFileInput()}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-link"
                                                onClick={() =>
                                                    setEditMode((prev) => ({ ...prev, image: !prev.image }))
                                                }
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            style={{ display: "none" }}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>

                                    {/* Bio Field */}
                                    <div className="mb-3 d-flex align-items-start">
                                        <label htmlFor="bio" className="form-label me-2 flex-grow-1">
                                            Bio (max 150 chars)
                                        </label>
                                        {editMode.bio ? (
                                            <textarea
                                                id="bio"
                                                className="form-control"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                maxLength={150}
                                                rows={3}
                                            />
                                        ) : (
                                            <p className="flex-grow-1 mb-0">{bio || "No bio yet."}</p>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-link"
                                            onClick={() =>
                                                setEditMode((prev) => ({ ...prev, bio: !prev.bio }))
                                            }
                                        >
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                    </div>

                                    {/* Save Button */}
                                    {editMode.name || editMode.image || editMode.bio ? (
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? "Updating..." : "Save Changes"}
                                        </button>
                                    ) : null}
                                </form>

                                {/* Feedback Message */}
                                {message && (
                                    <div className="mt-3 alert alert-info p-2" role="alert">
                                        {message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
