import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
    variable: "--font-manrope",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "TimeHorse - AI Calendar",
    description: "Modern AI-powered calendar with natural language scheduling",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${manrope.variable} font-sans antialiased`}>
                {children}
                <Toaster
                    position="top-center"
                    richColors
                    toastOptions={{
                        style: {
                            fontFamily: "var(--font-manrope)",
                        },
                    }}
                />
            </body>
        </html>
    );
}
