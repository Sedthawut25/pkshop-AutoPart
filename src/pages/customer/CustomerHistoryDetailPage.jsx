import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"

export default function CustomerHistoryDetailPage() {
    const { historyId } = useParams();
    const nav = useNavigate();

    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [claimForm, setClaimForm] = useState({
        claimType: "RETURN_MONEY",
        quantity: 1,
        description: "",
        imageFile: null,
    });
    const [submittingClaim, setSubmittingClaim] = useState(false); 

    async function loadHistory() {
        try {
            const token = localStorage.getItem("pk_token");

            const res = await axios.get(
                `http://localhost:8080/api/customer/orders/${historyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setHistory(res.data.data);
        }
        catch(err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (historyId) {
            loadHistory();
        }
    }, [historyId]);

    const handleOpenClaim = (item) => {
        setSelectedItem(item);
        setClaimForm({
            claimType: "RETURN_MONEY",
            quantity: 1,
            description: "",
            imageFile: null,
        });
        setShowClaimModal(true);
    };

    const handleSubmitClaim = async () => {

        if (!claimForm.description.trim()) return alert("กรุณากรอกเหตุผลการเคลม");
        if (!claimForm.imageFile) return alert("กรุณาอัปโหลดรูปภาพหลักฐานความเสียหายของสินค้าที่คุณสั่ง");
        
        setSubmittingClaim(true);
        try {
            const token = localStorage.getItem("pk_token");

            const formData = new FormData();
            formData.append("file", claimForm.imageFile);

            const uploadRes = await axios.post(
                "http://localhost:8080/api/upload/claim-image",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if(!uploadRes.data.success) {
                return alert("อัปโหลดรูปภาพไม่สำเร็จ: " + uploadRes.data.message);
            }

            const imageUrl = uploadRes.data.data

            await axios.post(
                "http://localhost:8080/api/claims",
                {
                    orderItemId: selectedItem.id,
                    quantity: claimForm.quantity,
                    claimType: claimForm.claimType,
                    description: claimForm.description,
                    imageUrl: imageUrl,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert("ส่งคำขอเคลมเรียบร้อยแล้ว");
            setShowClaimModal(false);
        }
        catch(err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการส่งคำขอเคลม");
        }
        finally {
            setSubmittingClaim(false);
        }
    }

    function statusBadge(status) {
        switch (status) {
            case "DELIVERED":
            case "COMPLETED":
            case "SUCCESS":
                return (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        จัดส่งสำเร็จ
                    </span>
                );
            case "CANCELLED":
                return (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        ยกเลิก
                    </span>
                );
            default:
                return (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                        {status}
                    </span>
                );
        }
    }

    const canClaim = ["DELIVERED", "COMPLETED", "SUCCESS"].includes(history?.status);

    if(loading) {
        return (
            <div className="py-24 text-center text-stone-500 font-medium">
                กำลังโหลดรายละเอียดประวัติการสั่งซื้อ...
            </div>
        );
    }

    if (!history) {
        return (
            <div className="py-24 text-center text-stone-500">
                <div className="text-lg font-semibold">ไม่พบข้อมูลประวัติคำสั่งซื้อนี้</div>
                <button
                    onClick={() => nav(-1)}
                    className="mt-4 rounded-xl border border-stone-300 px-4 py-2 hover:bg-stone-50"
                >
                    กลับไปหน้าก่อนหน้า
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div>
                <button
                    onClick={() => nav(-1)}
                    className="rounded-xl border border-stone-300 px-4 py-2 hover:bg-stone-50 font-medium text-sm transition"
                >
                    ← กลับ
                </button>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-xs text-stone-400 uppercase tracking-wider">
                            หมายเลขคำสั่งซื้อ
                        </div>
                        <div className="mt-1 text-2xl font-bold text-stone-900">
                            {history.orderNumber}
                        </div>
                        <div className="mt-2">
                            {statusBadge(history.status)}
                        </div>
                    </div>
                    <div className="text-sm text-stone-500 font-medium">
                        วันที่สั่ง:{" "}
                        {new Date(history.createdAt).toLocaleDateString("th-TH",{
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                         })}
                    </div>
                </div>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-4 text-lg font-bold text-stone-800">
                    รายการสินค้า
                </div>

                <div className="divide-y divide-stone-100">
                    {(history.items || []).map((item) => (
                        <div
                            key={item.id || item.productId} // 🟢 ใช้ item.id นำหน้าป้องกัน Key ชนกันใน React
                            className="flex flex-col gap-4 py-5 px-6 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <div className="font-bold text-stone-800">
                                    {item.productNameSnapshot || item.productName}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-stone-500">
                                    จำนวน {item.qty} ชิ้น
                                </div>
                            </div>

                            <div className="text-left sm:text-right">
                                <div className="text-xs text-stone-400">
                                    ฿ {Number(item.unitPrice || 0).toLocaleString()} / ชิ้น
                                </div>
                                <div className="text-lg font-extrabold text-stone-900">
                                    ฿ {Number(item.lineTotal || 0).toLocaleString()}
                                </div>

                                {canClaim && (
                                    <button
                                        onClick={() => handleOpenClaim(item)}
                                        className="mt-2 text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition"
                                    >
                                        ส่งเคลม / คืนสินค้า
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* การจัดส่งและสรุปราคา */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* บล็อกจัดส่ง */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="text-lg font-bold text-stone-800 border-b pb-3 border-stone-100">
                        การจัดส่ง
                    </div>
                    <div className="mt-4 space-y-4 text-sm">
                        <InfoRow
                            label="บริษัทขนส่ง"
                            value={history.shippingProvider || "-"}
                        />
                        <InfoRow 
                            label="หมายเลขติดตามพัสดุ"
                            value={history.trackingNumber || "-"}
                        />
                        <InfoRow 
                            label="ที่อยู่จัดส่ง"
                            value={history.shippingAddress || "-"}
                        />
                    </div>
                </div>

                {/* บล็อกสรุปยอดเงิน */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="text-lg font-bold text-stone-800 border-b pb-3 border-stone-100">
                        สรุปราคา
                    </div>

                    <div className="mt-4 space-y-3">
                        <PriceRow 
                            label="ยอดรวมสินค้า"
                            value={history.subTotal}
                        />
                        <PriceRow 
                            label="ส่วนลด"
                            value={history.discount}
                            negative
                        />
                        <PriceRow 
                            label="ค่าจัดส่ง"
                            value={history.shippingFee}
                        />
                        <div className="border-t border-dashed border-stone-200 pt-4 mt-2">
                            <PriceRow 
                                label="ยอดสุทธิ"
                                value={history.grandTotal}
                                big
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showClaimModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-stone-900">ส่งเคลม / คืนสินค้า</h3>
                        <p className="mt-2 text-sm text-stone-500 mb-4">สินค้า: {selectedItem?.productNameSnapshot}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="claimType" className="block text-sm font-semibold text-stone-700 mb-1">ความต้องการ</label>
                                <select
                                    id="claimType"
                                    className="w-full rounded-xl border border-stone-300 px-4 py-2"
                                    value={claimForm.claimType}
                                    onChange={e => setClaimForm({...claimForm, claimType: e.target.value})}
                                >
                                    <option value="RETURN_MONEY">คืนเงิน</option>
                                    <option value="REPLACE_PRODUCT">เปลี่ยนสินค้าชิ้นใหม่</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="claimQuantity" className="block text-sm font-semibold text-stone-700 mb-1">จำนวนที่เคลม</label>
                                <input
                                    id="claimQuantity"
                                    type="number" min="1" max={selectedItem?.qty}
                                    className="w-full rounded-xl border border-stone-300 px-4 py-2"
                                    value={claimForm.quantity}
                                    onChange={e => setClaimForm({...claimForm, quantity: Number(e.target.value)})}
                                />
                            </div>                        
                        </div>

                        <div>
                            <label htmlFor="claimImage" className="block text-xs font-semibold text-stone-700 mb-1">รูปถ่ายสินค้าที่เสียหาย</label>
                            <input
                                id="claimImage"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setClaimForm({...claimForm, imageFile: file});
                                    }
                                }}      
                            />
                        </div>

                        <div>
                            <label htmlFor="claimDescription" className="block text-sm font-semibold text-stone-700 mb-1">เหตุผลและรายละเอียด</label>
                            <textarea 
                                id="claimDescription"
                                rows="2" 
                                className="w-full rounded-xl border border-stone-300 px-4 py-2"
                                placeholder="อธิบายปัญหาที่พบ"
                                value={claimForm.description}
                                onChange={e => setClaimForm({...claimForm, description: e.target.value})}
                             ></textarea>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowClaimModal(false)}
                                className="px-4 py-2 rounded-xl text-stone-500 hover:bg-stone-100 font-semibold"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSubmitClaim}
                                disabled={submittingClaim}
                                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 disabled:opacity-50"
                            >   
                                {submittingClaim ? "กำลังส่ง..." : "ยืนยันการเคลม"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow ({label, value}) {
    return (
        <div>
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                {label}
            </div>
            <div className="mt-1 font-medium text-stone-800 break-words">
                {value}
            </div>
        </div>
    );
}

InfoRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function PriceRow ({label, value, negative = false, big = false}) {
    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-stone-500 font-medium">
                {label}
            </div>

            <div
                className={`font-bold ${
                    big ? "text-2xl text-stone-900" : "text-base text-stone-800"
                } ${negative ? "text-red-500" : ""} `}
            >
                {negative && value > 0 ? "-" : ""} ฿ {Number(value || 0).toLocaleString()}
            </div>
        </div>
    );
}

PriceRow.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number,
    negative: PropTypes.bool,
    big: PropTypes.bool,
};