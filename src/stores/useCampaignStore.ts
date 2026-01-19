import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Campaign, SaveFileExport } from '../types/Persistence';

export const useCampaignStore = defineStore('campaign', () => {
    const campaigns = ref<Campaign[]>([]);
    const activeCampaignId = ref<string | null>(null);
    const isLoading = ref(false);

    const activeCampaign = computed(() =>
        campaigns.value.find(c => c.id === activeCampaignId.value)
    );

    function createCampaign(name: string) {
        const newCampaign: Campaign = {
            id: crypto.randomUUID(),
            name,
            created: Date.now(),
            lastPlayed: Date.now(),
            gold: 0,
            xp: 0,
            talents: {},
            portalUpgrades: {},
            runHistory: [],
        };
        campaigns.value.push(newCampaign);
        activeCampaignId.value = newCampaign.id;
        saveToLocalStorage();
    }

    function deleteCampaign(id: string) {
        campaigns.value = campaigns.value.filter(c => c.id !== id);
        if (activeCampaignId.value === id) {
            activeCampaignId.value = null;
        }
        saveToLocalStorage();
    }

    function selectCampaign(id: string) {
        const campaign = campaigns.value.find(c => c.id === id);
        if (campaign) {
            activeCampaignId.value = id;
            campaign.lastPlayed = Date.now();
            saveToLocalStorage();
        }
    }

    function saveToLocalStorage() {
        localStorage.setItem('mad_mage_campaigns', JSON.stringify(campaigns.value));
        localStorage.setItem('mad_mage_active_campaign', activeCampaignId.value || '');
    }

    function loadFromLocalStorage() {
        const storedCampaigns = localStorage.getItem('mad_mage_campaigns');
        const storedActiveId = localStorage.getItem('mad_mage_active_campaign');

        if (storedCampaigns) {
            try {
                campaigns.value = JSON.parse(storedCampaigns);
            } catch (e) {
                console.error('Failed to parse campaigns', e);
                campaigns.value = [];
            }
        }

        if (storedActiveId) {
            if (campaigns.value.find(c => c.id === storedActiveId)) {
                activeCampaignId.value = storedActiveId;
            }
        }
    }

    function exportData(): string {
        const exportData: SaveFileExport = {
            version: 1,
            timestamp: Date.now(),
            campaigns: campaigns.value
        };
        return JSON.stringify(exportData, null, 2);
    }

    function importData(json: string): boolean {
        try {
            const data = JSON.parse(json) as SaveFileExport;
            if (data.campaigns && Array.isArray(data.campaigns)) {
                campaigns.value = data.campaigns;
                // Reset active ID if it doesn't exist anymore
                if (activeCampaignId.value && !campaigns.value.find(c => c.id === activeCampaignId.value)) {
                    activeCampaignId.value = null;
                }
                saveToLocalStorage();
                return true;
            }
        } catch (e) {
            console.error("Import failed", e);
        }
        return false;
    }

    // Initialize
    loadFromLocalStorage();

    return {
        campaigns,
        activeCampaignId,
        activeCampaign,
        createCampaign,
        deleteCampaign,
        selectCampaign,
        saveToLocalStorage, // Public for manual triggers if needed
        exportData,
        importData,
        isLoading
    };
});
