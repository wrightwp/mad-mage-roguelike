import { ref } from 'vue';
import type { DungeonNode } from '../types';

export interface ViewBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

export const useMapViewport = (mapWidth: number, mapHeight: number) => {
    const viewBox = ref<ViewBox>({ x: 0, y: 0, w: mapWidth, h: 800 });
    const isDragging = ref(false);
    const startPan = ref({ x: 0, y: 0 });

    const scrollToBottom = () => {
        viewBox.value.y = mapHeight - 800;
    };

    const scrollToNode = (node: DungeonNode) => {
        const targetY = Math.max(0, Math.min(mapHeight - 800, node.y - 400));

        const startY = viewBox.value.y;
        const dist = targetY - startY;
        const duration = 500;
        const startTime = performance.now();

        const animate = (time: number) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // cubic out

            viewBox.value.y = startY + dist * ease;

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const direction = e.deltaY > 0 ? 1 : -1;

        const w = viewBox.value.w;
        const h = viewBox.value.h;

        // Limits
        if (direction < 0 && w < 400) return; // Max Zoom In
        if (direction > 0 && w > mapWidth * 2) return; // Max Zoom Out

        const newW = w * (1 + direction * zoomIntensity);
        const newH = h * (1 + direction * zoomIntensity);

        // Zoom towards center
        const dx = (w - newW) / 2;
        const dy = (h - newH) / 2;

        viewBox.value.x += dx;
        viewBox.value.y += dy;
        viewBox.value.w = newW;
        viewBox.value.h = newH;
    };

    const handleMouseDown = (e: MouseEvent) => {
        isDragging.value = true;
        startPan.value = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.value) return;
        e.preventDefault();

        const dx = e.clientX - startPan.value.x;
        const dy = e.clientY - startPan.value.y;

        const container = e.currentTarget as HTMLElement;
        const scaleX = viewBox.value.w / container.clientWidth;
        const scaleY = viewBox.value.h / container.clientHeight;

        viewBox.value.x -= dx * scaleX;
        viewBox.value.y -= dy * scaleY;

        startPan.value = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.value = false;
    };

    return {
        viewBox,
        isDragging,
        scrollToBottom,
        scrollToNode,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
};
