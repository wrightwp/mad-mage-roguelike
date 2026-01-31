import { ref, onMounted, onUnmounted } from 'vue';

export const useResizablePanel = () => {
    const leftPanelWidth = ref(600);
    const isResizingLeft = ref(false);

    const startResizingLeft = (e: MouseEvent) => {
        isResizingLeft.value = true;
        e.preventDefault();
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isResizingLeft.value) {
            // Enforce min 400, and ensure map stays at least 700
            const maxWidth = window.innerWidth - 700;
            leftPanelWidth.value = Math.max(400, Math.min(e.clientX, maxWidth));
        }
    };

    const stopResizing = () => {
        isResizingLeft.value = false;
    };

    onMounted(() => {
        window.addEventListener('mousemove', handleGlobalMouseMove);
        window.addEventListener('mouseup', stopResizing);
    });

    onUnmounted(() => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', stopResizing);
    });

    return {
        leftPanelWidth,
        startResizingLeft
    };
};
