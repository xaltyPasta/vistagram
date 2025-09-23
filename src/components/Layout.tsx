import React from "react";
import Head from "next/head";
interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

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
                <link rel="icon" href="/favicon.png" />
            </Head>
            <div className="bg-light min-vh-100">
                <main>{children}</main>
            </div>
        </>
    );
}
