import axios from "axios";
import { authStorage } from "../utils/authStorage";

export const adminAccounting = {
    getStripeSummary: async () => {
        try {
            // ดึง Token ออกมา
            const token = authStorage.token();

            // แนบ Token ไปกับ Headers
            const res = await axios.get("/api/admin/accounting/stripe-summary", {
                headers: {
                    Authorization: `Bearer ${token}`, // สำคัญมาก!
                },
            });

            return res.data?.data || res.data;
        }
        catch (error) {
            console.error("Stripe API Error: ", error);
            throw error;
        }
    },
};