import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function AdminClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAllClaims();
    }, []);

    const fetchAllClaims = async () => {
        try {
            const token = localStorage.getItem("pk_token");
            const res = await axios.get("http://localhost:8080/api/admin/claims", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            if (res.data.success) {
                setClaims(res.data.data || []);
            }
        }
        catch (error) {
            console.error("Error Fetching admin claims: ", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (claimsId, newStatus) => {
        const confirmMsg = newStatus === "APPROVED" ? "คุณต้องการอนุมัติคำขอเคลมนี้ใช่หรือไม่" : "คุณต้องการปฏิเสธคำขอเคลมนี้ใช่หรือไม่?";
        if (!window.confirm(confirmMsg)) return;

        try {
            setActionLoading(true);
            const token = localStorage.getItem("pk_token");

            const res = await axios.put(`http://localhost:8080/api/admin/claims/${claimsId}/status`,
                {status: newStatus},
                {headers: {Authorization: `Bearer ${token}`}}
            );

            if (res.data.success) {
                alert("อัปเดตสถานะคำขอเคลมสำเร็จ");
                fetchAllClaims();
            }
        }
        catch (error) {
            console.error("Error fetching claims status: ", error);
            setActionLoading(false);
            alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        }
        finally {
            setActionLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
            case "APPROVED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-stone-100 text-stone-700 border-stone-200";
        }
    };
    if(loading) return <div className="py-24 text-center text-stone-500 font-medium">กำลังโหลดรายการคำขอเคลม....</div>

    return (
        <div className="space-y-6 p-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900 mb-1">จัดการรายการคืน / รายการเตลมสินค้า</h2>
                <p className="text-sm text-stone-500">ตรวจสอบหลักฐานการเคลมและอนุมัติ</p>
            </div>
        </div>
    )
}


