import axios from "axios";
import { useEffect, useState } from "react";
import { Eye, Check, X } from "lucide-react";

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
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const responseData = res.data.data;
                const claimsArray = responseData?.content || responseData || [];
                setClaims(Array.isArray(claimsArray) ? claimsArray : []);
            }
        } catch (error) {
            console.error("Error fetching admin claims:", error);
            setClaims([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (claimId, newStatus) => {
        const confirmMsg = newStatus === "APPROVED" ? "คุณต้องการอนุมัติคำขอเคลมนี้ใช่หรือไม่?" : "คุณต้องการปฏิเสธคำขอเคลมนี้ใช่หรือไม่?";
        if (!globalThis.confirm(confirmMsg)) return;

        try {
            setActionLoading(true);
            const token = localStorage.getItem("pk_token");
            
            const res = await axios.put(`http://localhost:8080/api/admin/claims/${claimId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                alert(res.data.message || "อัปเดตสถานะคำขอเคลมสำเร็จ!");
                fetchAllClaims(); // รีเฟรชข้อมูลใหม่
            } else {
                alert(res.data.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
            }
        } catch (error) {
            console.error("Error updating claim status:", error);
            alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        } finally {
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

    const getClaimImage = (claim) => {
        if(claim.imageUrl) return claim.imageUrl;
        if(claim.attachments && claim.attachments.length > 0) {
            return claim.attachments[0].fileUrl || claim.attachments[0].imageUrl;
        }
        return null;
    };

    const getClaimProductName = (claim) => {
        if(claim.productName) return claim.productName;
        if(claim.product && claim.product.name) return claim.product.name;
        return "สินค้าทั่วไป";
    }

    if (loading) return <div className="py-24 text-center text-stone-500 font-medium">กำลังโหลดรายการคำขอเคลม...</div>;

    return (
        <div className="space-y-4 md:space-y-6 p-3 md:p-6 max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="rounded-2xl md:rounded-3xl border border-stone-200 bg-white p-4 md:p-6 shadow-sm">
                <h2 className="text-lg md:text-2xl font-bold text-stone-900 mb-1">จัดการรายการคืน / เคลมสินค้า</h2>
                <p className="text-xs md:text-sm text-stone-500">ตรวจสอบหลักฐานและอนุมัติคำขอเปลี่ยนสินค้าหรือคืนเงินจากลูกค้า</p>
            </div>

            {claims.length === 0 ? (
                <div className="rounded-2xl md:rounded-3xl border-2 border-dashed border-stone-200 bg-white py-12 md:py-16 text-center text-stone-400 font-medium text-sm md:text-base">
                    ยังไม่มีคำขอคืนหรือเคลมสินค้าส่งเข้ามาในขณะนี้
                </div>
            ) : (
                <>
                    {/* 📱 Mobile View (Card Style) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {(claims || []).map((claim) => (
                            <div key={claim.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                                    <span className="font-bold text-stone-900 text-sm">
                                        CLM-{String(claim.id).padStart(6, '0')}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyle(claim.status)}`}>
                                        {claim.status === "PENDING" && "รอตรวจสอบ"}
                                        {claim.status === "APPROVED" && "อนุมัติแล้ว"}
                                        {claim.status === "REJECTED" && "ปฏิเสธ"}
                                    </span>
                                </div>

                                <div className="flex gap-3">
                                    {getClaimImage(claim) ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImage(getClaimImage(claim))}
                                            aria-label="ดูรูปภาพหลักฐานคำขอเคลม"
                                            className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shrink-0 flex items-center justify-center shadow-sm"
                                        >
                                            <img src={getClaimImage(claim)} alt="หลักฐาน" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <Eye className="w-5 h-5 text-white shadow-sm" />
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-[10px] text-stone-400 font-semibold shrink-0">
                                            ไม่มีรูปภาพ
                                        </div>
                                    )}

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="font-bold text-stone-800 text-sm line-clamp-2">{getClaimProductName(claim)}</div>
                                        <div className="text-xs text-stone-500 font-medium">จำนวน {claim.quantity} ชิ้น</div>
                                        <div className="pt-1">
                                            {claim.claimType === "RETURN_MONEY" ? (
                                                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[10px] font-bold">ขอคืนเงิน</span>
                                            ) : (
                                                <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md text-[10px] font-bold">เปลี่ยนชิ้นใหม่</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-600 border border-stone-100/70">
                                    <div className="font-bold text-stone-500 mb-0.5">เหตุผลการเคลม:</div>
                                    <p className="break-words line-clamp-3">{claim.description || "-"}</p>
                                </div>

                                {claim.status === "PENDING" && (
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <button
                                            onClick={() => handleUpdateStatus(claim.id, "APPROVED")}
                                            disabled={actionLoading}
                                            className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:bg-emerald-200 transition border border-emerald-200 flex items-center justify-center gap-1.5 text-xs font-bold"
                                        >
                                            <Check className="w-4 h-4" /> อนุมัติ
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(claim.id, "REJECTED")}
                                            disabled={actionLoading}
                                            className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 transition border border-red-200 flex items-center justify-center gap-1.5 text-xs font-bold"
                                        >
                                            <X className="w-4 h-4" /> ปฏิเสธ
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 💻 Desktop View (Table Style) */}
                    <div className="hidden md:block rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-stone-50/70 border-b border-stone-100 text-stone-600 text-xs uppercase tracking-wider font-bold">
                                        <th className="py-4 px-6 w-32">รหัสเคลม</th>
                                        <th className="py-4 px-6">สินค้า</th>
                                        <th className="py-4 px-6 w-32">ความต้องการ</th>
                                        <th className="py-4 px-6 w-28 text-center">รูปหลักฐาน</th>
                                        <th className="py-4 px-6">เหตุผลการเคลม</th>
                                        <th className="py-4 px-6 w-32 text-center">สถานะ</th>
                                        <th className="py-4 px-6 w-28 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-sm">
                                    {(claims || []).map((claim) => (
                                        <tr key={claim.id} className="hover:bg-stone-50/40 transition">
                                            <td className="py-4 px-6 font-bold text-stone-900 whitespace-nowrap">
                                                CLM-{String(claim.id).padStart(6, '0')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-stone-800 line-clamp-2">{getClaimProductName(claim)}</div>
                                                <div className="text-xs text-stone-400 mt-0.5">จำนวน {claim.quantity} ชิ้น</div>
                                            </td>
                                            <td className="py-4 px-6 font-semibold whitespace-nowrap">
                                                {claim.claimType === "RETURN_MONEY" ? (
                                                    <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">ขอคืนเงิน</span>
                                                ) : (
                                                    <span className="text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg text-xs">เปลี่ยนชิ้นใหม่</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 flex justify-center">
                                                {getClaimImage(claim) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedImage(getClaimImage(claim))}
                                                        aria-label="ดูรูปภาพหลักฐานคำขอเคลม"
                                                        className="group relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer shadow-sm flex items-center justify-center"
                                                        title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                                                    >
                                                        <img src={getClaimImage(claim)} alt="หลักฐาน" className="w-full h-full object-cover group-hover:scale-110 transition duration-200" />
                                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                                            <Eye className="w-4 h-4 text-white" />
                                                        </div>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-stone-400">ไม่มีรูปภาพ</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-stone-600">
                                                <p className="line-clamp-2 text-xs" title={claim.description}>{claim.description || "-"}</p>
                                            </td>
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(claim.status)}`}>
                                                    {claim.status === "PENDING" && "รอตรวจสอบ"}
                                                    {claim.status === "APPROVED" && "อนุมัติแล้ว"}
                                                    {claim.status === "REJECTED" && "ปฏิเสธ"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {claim.status === "PENDING" ? (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(claim.id, "APPROVED")}
                                                            disabled={actionLoading}
                                                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition border border-emerald-200"
                                                            title="อนุมัติการเคลม"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(claim.id, "REJECTED")}
                                                            disabled={actionLoading}
                                                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200"
                                                            title="ปฏิเสธการเคลม"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-stone-400 font-medium">จัดการแล้ว</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* 🖼️ Image Preview Modal (ปรับปรุงให้ Responsive และอยู่ตรงกลาง) */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-transparent flex flex-col items-center justify-center">
                        
                        {/* ปุ่มปิด */}
                        <button 
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            aria-label="ปิดภาพหลักฐาน"
                            className="absolute -top-10 right-0 md:top-0 md:-right-12 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition shadow-lg backdrop-blur-md"
                        >
                            <X className="w-6 h-6 md:w-8 md:h-8" />
                        </button>

                        {/* กล่องใส่รูป */}
                        <div className="bg-white p-2 rounded-2xl shadow-2xl overflow-hidden w-full flex justify-center">
                            <img 
                                src={selectedImage} 
                                alt="หลักฐานเคลมรูปใหญ่" 
                                className="w-auto h-auto max-w-full max-h-[75vh] md:max-h-[85vh] rounded-xl object-contain"
                            />
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
}