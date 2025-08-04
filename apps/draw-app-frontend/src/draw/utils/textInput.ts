import { screenToWorldX, screenToWorldY } from "@/draw/infiniteCanvas";

export function createTextInput(
  canvas: HTMLCanvasElement,
  screenX: number,
  screenY: number,
  scale: number,
  onFinish: (content: string, worldX: number, worldY: number) => void
) {
  const rect = canvas.getBoundingClientRect();
  const worldX = screenToWorldX(screenX - rect.left, scale);
  const worldY = screenToWorldY(screenY - rect.top, scale);

  const input = document.createElement("textarea");
  input.className =
    "canvas-text-input py-0.5 absolute bg-transparent text-white border-none rounded font-sans text-base outline-none min-w-[100px] resize-none overflow-hidden z-10";
  input.style.left = screenX + "px";
  input.style.top = screenY + "px";
  input.style.transform = `scale(${scale})`;
  input.style.transformOrigin = "top left";
  input.placeholder = "";
  input.value = "";
  input.rows = 1;

  canvas.parentElement?.appendChild(input);
  input.focus();

  const autoResize = () => autoResizeTextarea(input, canvas);
  autoResize();

  input.addEventListener("input", autoResize);

  let isRemoved = false;
  const finishEditing = () => {
    if (isRemoved) return;
    isRemoved = true;

    if (input.value.trim()) {
      onFinish(input.value, worldX, worldY);
    }

    if (input.parentElement) {
      input.remove();
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    } else if (e.key === "Escape") {
      input.remove();
    }
  });

  input.addEventListener("blur", finishEditing);
}

function autoResizeTextarea(textarea: HTMLTextAreaElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";

  ctx.font = "16px Cascadia Code, Chalkboard SE, sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "1px";

  const lines = textarea.value.split("\n");
  const maxWidth = Math.max(
    ...lines.map((line) => ctx.measureText(line).width)
  );
  textarea.style.width = Math.max(100, maxWidth + 20) + "px";
}