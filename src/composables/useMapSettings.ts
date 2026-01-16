import { ref } from 'vue';
import { generateDungeon } from '../logic/dungeonGen';
import type { DungeonMapData } from '../types';

export const useMapSettings = (
    mapWidth: number,
    mapHeight: number,
    onInit?: () => void
) => {
    const mapData = ref<DungeonMapData | null>(null);
    const floorCount = ref(15);
    const currentFloor = ref(1); // Start at Floor 1
    const showRestartConfirm = ref(false);
    const showConfigModal = ref(true); // Show config modal on first load
    const revealAll = ref(false);

    const nodeTypeCounts = ref<Record<string, number>>({
        combat: 30,
        rest: 6,
        treasure: 5,
        puzzle: 4,
        social: 6,
        exploration: 8
    });

    const initMap = () => {
        mapData.value = generateDungeon(
            floorCount.value,
            currentFloor.value, // Pass current floor
            mapWidth,
            mapHeight,
            nodeTypeCounts.value
        );

        if (onInit) {
            onInit();
        }
    };

    const generateWithConfig = (config: {
        floor: number;
        floorDepth: number;
        nodeCounts: Record<string, number>;
    }) => {
        // Update settings from config
        currentFloor.value = config.floor;
        floorCount.value = config.floorDepth;
        nodeTypeCounts.value = { ...config.nodeCounts };

        // Generate the map
        initMap();

        // Close the modal
        showConfigModal.value = false;
    };

    const openConfigModal = () => {
        showConfigModal.value = true;
    };

    const restartMap = () => {
        showRestartConfirm.value = false;
        openConfigModal(); // Open config modal instead of directly regenerating
    };

    return {
        mapData,
        floorCount,
        currentFloor,
        nodeTypeCounts,
        revealAll,
        showRestartConfirm,
        showConfigModal,
        initMap,
        restartMap,
        generateWithConfig,
        openConfigModal
    };
};
