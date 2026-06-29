import axios from 'axios';
import { Package } from 'lucide-react';
import React, { useEffect, useState } from 'react'

export default function CustomerClaimsPage() {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaims();
    }, [])

    const fetchClaims = async () => {
        try {
            const token = localStorage.getItem("pk_token");

            const res = await axios.get("http://localhost:8080/api/customer/claims", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            if (res.data.success) {
                setClaims(res.data.data || []);
            }
        }
        catch (error) {
            console.error("Error fetching claims: " , error);
        }
        finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING" :
                return (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700 border border-amber-200">
                        รอตรวจสอบ
                    </span>
                );
            case "APPROVED" :
                return (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 border border-emerald-200">
                        อนุมัติแล้ว
                    </span>
                );
            case "REJECTED" :
                return (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 border border-red-200">
                        ปฏิเสธการเคลม
                    </span>
                );
            default: 
                return (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 border border-stone-200">
                        {status}
                    </span>
                )
        }
    };

    //ประเภทการเคลมสินค้าไทย
    const getClaimTypeText = (type) => {
        return type === "RETURN_MONEY" ? "ขอคืนเงิน" : "เปลี่ยนสินค้าชิ้นใหม่";
    };

    if (loading) {
        return (
            <div className="py-24 text-center text-stone-500 font-medium">
                กำลังโหลดประวัติการสั่งซื้อสินค้า
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">ประวัติการคืน / เคลมสินค้า</h2>
                <p className="text-sm text-stone-500">ติดตามสถานะการขอคืนเงินและขอเคลมสินค้า</p>
            </div>

            {claims.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white py-24 text-center">
                    <Package className="w-16 h-16 text-stone-300 mb-4" strokeWidth={1.5}/>
                    <div className="text-lg font-bold text-stone-700">ยังไม่มีประวัติการส่งเคลมสินค้า</div>
                    <p className="text-sm text-stone-500 mt-2">หากสินค้ามีปัญหา สามารถส่งเคลมได้ที่หน้าประวัติการสั่งซื้อ</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {claims.map((claim) => (
                        <div
                            key={claims.id}
                            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 transition hover:border-stone-300"
                        >
                            <div className="w-full md:w-40 h-40 shrink-0 rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 flex items-center justify-center">
                                {claim.imageUrl ? (
                                    <img 
                                        src={claim.imageUrl} 
                                        alt="หลักฐานการเคลม" 
                                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                    />
                                ) : (
                                    <div className="text-stone-400 text-xs font-semibold">ไม่มีรูปภาพ</div>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-xs text-stone-400 uppercase tracking-wider mb-1 font-semibold">
                                            รหัสการเคลม: CLM-{String(claim.id).padStart(6, '0')}
                                        </div>
                                        <h3 className="text-lg font-bold text-stone-800">
                                            {claim.productName || "รายการสินค้าที่ส่งเคลม"}
                                        </h3>
                                    </div>
                                    <div>
                                        {getStatusBadge(claim.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                    <div>
                                        <span className="text-stone-500 block text-xs font-bold mb-1">ความต้องการ</span>
                                        <span className="font-semibold text-stone-800">{getClaimTypeText(claim.claimType)}</span>
                                    </div>
                                    <div>
                                        <span className="text-stone-500 block text-xs font-bold mb-1">จำนวน</span>
                                        <span className="font-semibold text-stone-800">{claim.quantity} ชิ้น</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-stone-500 block text-xs font-semibold mb-1">เหตุผลและรายละเอียด</span>
                                        <p className="text-stone-700 text-sm">{claim.description || "-"}</p>
                                    </div>
                                </div>

                                <div className="text-xs font-medium text-stone-400 pt-2 border-t border-stone-100">
                                    ส่งเคลมเมื่อวันที่ : {new Date(claim.createdAt).toLocaleDateString("th-TH", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })} น.
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}


