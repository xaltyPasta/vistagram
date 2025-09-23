import React from "react";
import Head from "next/head";

interface LayoutProps {
    /** Child components to render inside the layout */
    children: React.ReactNode;
    /** Page title (defaults to Vistagram branding) */
    title?: string;
    /** Page description for SEO (defaults to platform description) */
    description?: string;
}

/**
 * Layout component providing HTML head management and page wrapper.
 * Sets page title, description, viewport, favicon, and background styling.
 *
 * @param children Content to render inside the layout
 * @param title Optional page title (defaults to "Vistagram - Share Your Moments")
 * @param description Optional page description for SEO
 */
export default function Layout({
    children,
    title = "Vistagram - Share Your Moments",
    description = "A simple photo sharing platform"
}: LayoutProps) {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" /> {/* Favicon for browser tab */}
            </Head>
            <div className="bg-light min-vh-100">
                <main>{children}</main> {/* Main content area */}
            </div>
        </>
    );
}
