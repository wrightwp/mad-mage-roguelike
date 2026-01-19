import { ref, onMounted, onUnmounted } from 'vue';

export const useResizablePanel = () => {
    const leftPanelWidth = ref(220);
    const rightPanelWidth = ref(450);
    const isResizingLeft = ref(false);
    const isResizingRight = ref(false);

    const startResizingLeft = (e: MouseEvent) => {
        isResizingLeft.value = true;
        e.preventDefault();
    };

    const startResizingRight = (e: MouseEvent) => {
        isResizingRight.value = true;
        e.preventDefault();
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isResizingLeft.value) {
            // Enforce min 220, and ensure map stays at least 700
            const maxWidth = window.innerWidth - rightPanelWidth.value - 700;
            leftPanelWidth.value = Math.max(220, Math.min(e.clientX, maxWidth));
        } else if (isResizingRight.value) {
            // Enforce min 450, and ensure map stays at least 700
            const maxWidth = window.innerWidth - leftPanelWidth.value - 700;
            const targetWidth = window.innerWidth - e.clientX;
            rightPanelWidth.value = Math.max(450, Math.min(targetWidth, maxWidth));
        }
    };

    const stopResizing = () => {
        isResizingLeft.value = false;
        isResizingRight.value = false;
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
        rightPanelWidth,
        startResizingLeft,
        startResizingRight
    };
};
