import { Topbar } from "@/components/TopBar";
import { ZoomBar } from "@/components/ZoomBar";

export default function CanvasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <>
            <Topbar />
            {children}
            <ZoomBar />
        </>
    )
}