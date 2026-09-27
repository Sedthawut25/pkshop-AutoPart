import { api } from "./axios";

export const adminAccounting = {
    getStripeSummary: async () => {
        try {
            const res = await api.get("/api/admin/accounting/stripe-summary");
            return res.data?.data || res.data;
        }
        catch (error) {
            console.error("Stripe API Error: ", error);
            throw error;
        }
    },
};