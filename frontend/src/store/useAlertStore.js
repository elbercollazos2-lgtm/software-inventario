import { create } from 'zustand';
import { dashboardService } from '../services/api';

export const useAlertStore = create((set, get) => ({
    stats: null,
    alertCount: 0,
    loading: false,
    error: null,

    fetchStats: async () => {
        // Avoid double fetching if already loading
        if (get().loading) return;

        set({ loading: true });
        try {
            const response = await dashboardService.getStats();
            const stats = response.data.stats || {};
            const count = (stats.expiredCount || 0) + (stats.lowStockCount || 0);

            set({
                stats: response.data,
                alertCount: count,
                loading: false,
                error: null
            });
        } catch (err) {
            console.error("Error fetching stats:", err);
            set({ error: err, loading: false });
        }
    },

    // Helper to start polling
    startPolling: (intervalMs = 60000) => {
        const fetch = get().fetchStats;
        fetch(); // Initial fetch

        const intervalId = setInterval(fetch, intervalMs);
        return () => clearInterval(intervalId); // Return cleanup function
    }
}));
