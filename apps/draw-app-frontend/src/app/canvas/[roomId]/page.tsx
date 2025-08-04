import { Canvas } from "@/components/Canvas"

export default async function CanvasSharePage({ params }: {
    params: {
        roomId: string
    }
}) {
    const temp = (await params);
    console.log(temp);
    
    return (
        <div>
            <Canvas roomId={temp.roomId}/>
        </div>
    )
}