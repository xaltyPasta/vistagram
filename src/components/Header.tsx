import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
    onUploadClick?: () => void;
}

function formatName(name: string): string {
    return name
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default function Header({ onUploadClick }: HeaderProps) {
    const { data: session, status } = useSession();
    const [open, setOpen] = useState(false);

    // Smooth scroll to upload form
    const handleUploadClick = () => {
        if (onUploadClick) {
            onUploadClick(); // keep custom behavior if passed
        }
        const uploadForm = document.getElementById("uploadForm");
        if (uploadForm) {
            const yOffset = -80; // adjust for sticky header height
            const y = uploadForm.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    return (
        <header className="bg-white border-bottom sticky-top">
            <div className="container d-flex justify-content-between align-items-center py-3">
                <Link
                    href="/"
                    className="text-primary fw-bold font-instagram"
                    style={{ textDecoration: "none", fontSize: "2rem" }}
                >
                    Vistagram
                </Link>

                <div className="d-flex align-items-center gap-3">
                    {status === "loading" ? (
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : session?.user ? (
                        <>
                            {/* Profile Dropdown */}
                            <div className="position-relative">
                                <Image
                                    src={session.user.image || "/default-avatar.png"}
                                    alt={session.user.name || "User"}
                                    width={40}
                                    height={40}
                                    className="rounded-circle"
                                    role="button"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setOpen(!open)}
                                />

                                {open && (
                                    <div
                                        className="position-absolute end-0 mt-2 p-3 bg-white border rounded shadow-sm"
                                        style={{
                                            minWidth: "auto",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <div className="fw-semibold text-dark fs-6">
                                            {session.user.name ? formatName(session.user.name) : "User"}
                                        </div>
                                        <button
                                            className="btn btn-link text-danger text-decoration-none mt-2 p-0 fs-6"
                                            onClick={() => signOut()}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={() => signIn("google")}>
                            Sign In with Google
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
