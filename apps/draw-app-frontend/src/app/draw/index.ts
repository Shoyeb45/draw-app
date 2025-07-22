
type Shape = {
    type: "rect",
    x: number,
    y: number,
    width: number,
    height: number
} | {
    type: "circle",
    x: number,
    y: number,
    radius: number,
};

let existingShape: Shape[] = []

export function initDraw(canvas: HTMLCanvasElement, shapes: Shape[]) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(canvas);
    window.addEventListener("resize", resizeCanvas, false);
    existingShape = shapes;
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw(canvas);
    }    
}



function draw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
        return;
    }
    
    drawInitialiShapes(ctx);
    ctx.fillStyle = "rgba(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log("drawing..");
    
    ctx.strokeStyle = "rgba(255, 255, 255)"
    
    let clicked = false;
    let startX = 0, startY = 0;
    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });
    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        existingShape.push({
            type: "rect",
            x: startX,
            y: startY,
            width: e.clientX - startX,
            height: e.clientY - startY 
        });
    })
    
    
    
    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            console.log(existingShape);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = "rgba(0, 0, 0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // rendering exisiting shapes
            drawInitialiShapes(ctx)
            ctx.strokeStyle = "rgba(255, 255, 255)"
    
            ctx.strokeRect(startX, startY, width, height);
        }
    })

}

function drawInitialiShapes(ctx: CanvasRenderingContext2D) {
     existingShape.forEach(shape => {
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } 
    })
}