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
    const showRestartConfirm = ref(false);
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
            mapWidth,
            mapHeight,
            nodeTypeCounts.value
        );

        if (onInit) {
            onInit();
        }
    };

    const restartMap = () => {
        showRestartConfirm.value = false;
        initMap();
    };

    return {
        mapData,
        floorCount,
        nodeTypeCounts,
        revealAll,
        showRestartConfirm,
        initMap,
        restartMap
    };
};
