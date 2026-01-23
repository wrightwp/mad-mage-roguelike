import { ref, computed, watch } from 'vue';
import { useGameStore } from '../stores/useGameStore';

export const useMapSettings = (
    onInit?: () => void
) => {
    const gameStore = useGameStore();

    // Map data from store
    const mapData = computed(() => gameStore.mapData);
    const partyLocationId = computed(() => {
        const visited = gameStore.currentFloor?.visitedNodes;
        return visited && visited.length > 0 ? visited[visited.length - 1] : null;
    });

    const floorCount = ref(10);
    const currentFloor = ref(1); // Start at Floor 1
    const showRestartConfirm = ref(false);
    // Only show config modal if there is no active run
    const showConfigModal = ref(!gameStore.hasActiveRun);
    const revealAll = ref(true);

    const nodeTypeCounts = ref<Record<string, number>>({
        combat: 30,
        rest: 3,
        treasure: 4,
        puzzle: 6,
        social: 3,
        exploration: 4
    });

    const partySize = ref(4);
    const averagePartyLevel = ref(1);

    const initMap = () => {
        // Construct party state based on size/level 
        // (This is a simplified assumption since we don't have a full party builder UI yet)
        const party: any[] = Array(partySize.value).fill({
            id: 'placeholder',
            name: 'Hero',
            hp: 20,
            maxHp: 20
        });

        gameStore.startRun(party, averagePartyLevel.value, floorCount.value);

        // todo: sync settings to store if needed

        if (onInit) {
            onInit();
        }
    };

    // Restore settings from active run if available
    if (gameStore.hasActiveRun && gameStore.currentRun?.partyConfig) {
        partySize.value = gameStore.currentRun.partyConfig.size;
        averagePartyLevel.value = gameStore.currentRun.partyConfig.level;
    }

    // Watch for store changes (e.g. loading a save)
    watch(() => gameStore.currentRun?.partyConfig, (newConfig) => {
        if (newConfig) {
            partySize.value = newConfig.size;
            averagePartyLevel.value = newConfig.level;
        }
    }, { deep: true });

    // Watch for local changes to persist to store
    watch([partySize, averagePartyLevel], ([newSize, newLevel]) => {
        if (gameStore.hasActiveRun) {
            gameStore.updatePartyConfig(newSize, newLevel);
        }
    });

    const generateWithConfig = (config: {
        floor: number;
        floorDepth: number;
        nodeCounts: Record<string, number>;
        partySize: number;
        averagePartyLevel: number;
    }) => {
        // Update settings from config
        currentFloor.value = config.floor;
        floorCount.value = config.floorDepth;
        nodeTypeCounts.value = { ...config.nodeCounts };
        partySize.value = config.partySize;
        averagePartyLevel.value = config.averagePartyLevel;

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
        partySize,
        averagePartyLevel,
        initMap,
        restartMap,
        generateWithConfig,
        openConfigModal,
        partyLocationId
    };
};
