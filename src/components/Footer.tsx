import { FaUpload } from "react-icons/fa";

interface FooterProps {
    /** Callback triggered when the upload button is clicked */
    onUploadClick?: () => void;
}

/**
 * Footer component fixed at the bottom-right of the viewport.
 * Displays a circular upload button with shadow.
 *
 * @param onUploadClick Optional callback invoked on button click
 */
export default function Footer({ onUploadClick }: FooterProps) {
    return (
        <div
            className="position-fixed bottom-0 end-0 m-3"
            style={{ zIndex: 1000 }} // Ensure footer is above other elements
        >
            <button
                onClick={onUploadClick}
                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "60px", height: "60px", fontSize: "1.5rem", boxShadow: "0 4px 6px rgba(0,0,0,0.2)" }}
                title="Upload" // Tooltip for accessibility
            >
                <FaUpload />
            </button>
        </div>
    );
}
