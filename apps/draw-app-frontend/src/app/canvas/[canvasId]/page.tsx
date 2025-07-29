import { Whiteboard } from "@/components/Whiteboard"
import { Topbar } from "@/components/TopBar";
import { ZoomBar } from "@/components/ZoomBar";

export default function Canvas() {

    return (
        <div>
            <Topbar />            
            <Whiteboard />
            <ZoomBar />
        </div>
    )
}