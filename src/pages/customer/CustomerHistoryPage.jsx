import axios from "axios";
import { PackageCheck, RotateCcw, Star, XCircle } from "lucide-react";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useCart } from "./cart/CartContext";

export default function CustomerHistoryPage() {
    const nav = useNavigate();
    const { add } = useCart(); 

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // 🟢 เปลี่ยนจากเก็บชิ้นเดียว เป็นเก็บอาร์เรย์ของทุกรีวิวในออเดอร์นั้น
    const [reviewsData, setReviewsData] = useState([]); 

    async function loadOrders() {
        try {
            const token = localStorage.getItem("pk_token");

            const res = await axios.get(
                "http://localhost:8080/api/customer/orders/history",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const filtered = (res.data.data ||  []).filter(
                (o) =>
                    [
                        "DELIVERED",
                        "COMPLETED",
                        "SUCCESS",
                        "CANCELLED",
                    ].includes(o.status)
            );
            console.log("ORDERS => ", filtered);
            setOrders(filtered);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    const handleOpenReviewModal = (order) => {
        setSelectedOrder(order);
        
        const initialReviews = (order.items || []).map((item) => ({
            productId: item.product?.id || item.productId,
            productName: item.productNameSnapshot,
            rating: 5,
            comment: ""
        }));
        
        setReviewsData(initialReviews);
        setReviewModal(true);
    };

    // 🟢 ฟังก์ชันอัปเดตคะแนนดาวหรือคอมเมนต์เฉพาะชิ้นในอาเรย์
    const handleUpdateReviewField = (index, field, value) => {
        setReviewsData((prev) =>
            prev.map((rev, i) => (i === index ? { ...rev, [field]: value } : rev))
        );
    };

    async function submitReview() {
        try {
            const token = localStorage.getItem("pk_token");

            await Promise.all(
                reviewsData.map((rev) =>
                    axios.post(
                        `http://localhost:8080/api/customer/reviews/${selectedOrder.id}`,
                        {
                            productId: rev.productId,
                            rating: rev.rating,
                            comment: rev.comment,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                )
            );
            
            alert("ส่งรีวิวสินค้าทั้งหมดในออเดอร์นี้สำเร็จเรียบร้อย!");
            setReviewModal(false);
            setSelectedOrder(null);
            setReviewsData([]);
        }
        catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการส่งรีวิว");
        }
    }

    if(loading) {
        return (
            <div className="py-20 text-center">
                กำลังโหลด....
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div>
                <div className="text-3xl font-bold">
                    ประวัติคำสั่งซื้อ
                </div>
                <div className="mt-1 text-sm text-stone-500">
                    คำสั่งซื้อที่จัดส่งสำเร็จและยกเลิก
                </div>
            </div>

            <div className="space-y-5">
                {orders.map((o) => (
                    <div
                        key={o.id}
                        onClick={() => nav(`/customer/history/${o.id}`)}
                        className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:-[1.02]"
                    >
                        <div className="border-b bg-stone-50 px-5 py-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="text-xs text-stone-400">
                                        คำสั่งซื้อ
                                    </div>
                                    <div className="text-xl font-bold">
                                        {o.orderNumber}
                                    </div> 
                                </div>
                                <div className="flex items-center gap-3">
                                    {o.status === "DELIVERED" && (
                                        <button
                                            onClick={(e) => {e.stopPropagation(); handleOpenReviewModal(o);}}
                                            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition"
                                        >
                                            <Star size={16} fill="#facc15" className="text-yellow-400" />
                                            รีวิวออเดอร์นี้
                                        </button>
                                    )}

                                    {o.status === "DELIVERED" ? (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                                            <PackageCheck size={16} />
                                            จัดส่งสำเร็จ
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700">
                                            <XCircle size={16} />
                                            ยกเลิก
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 p-5">
                            {(o.items || []).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={
                                                item.productImageSnapshot || 
                                                item.product?.imageUrl || 
                                                "https://via.placeholder.com/900x675?text=PKSHOP"
                                            } 
                                            alt={item.productNameSnapshot || "Product"}
                                            className="h-24 w-24 rounded-2xl object-cover bg-stone-50" 
                                            onError={(e) => {
                                                e.currentTarget.src = "https://via.placeholder.com/900x675?text=No+Image";
                                            }}
                                        />
                                        <div>
                                            <div className="font-bold text-lg">
                                                {item.productNameSnapshot}
                                            </div>
                                            <div className="font-semibold text-stone-600">
                                                จำนวน {item.qty} ชิ้น
                                            </div>
                                            <div className="mt-1 text-sm font-bold text-stone-900">
                                                ฿{Number(item.lineTotal).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const unitPrice = item.lineTotal / item.qty;
                                                add({
                                                    productId: item.product?.id || item.productId,
                                                    productName: item.productNameSnapshot,
                                                    unitPrice: unitPrice,
                                                    imageUrl: item.productImageSnapshot || item.product?.imageUrl
                                                }, item.qty);
                                                
                                                nav("/customer/cart");
                                            }}
                                            className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50 transition"
                                        >
                                            <RotateCcw size={16} className="mr-2 inline" />
                                            สั่งซื้ออีกครั้ง
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {reviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl space-y-6">
                        <div>
                            <div className="text-2xl font-bold">รีวิวสินค้าในคำสั่งซื้อ</div>
                            <div className="text-sm text-stone-500 mt-1">ออเดอร์หมายเลข: {selectedOrder?.orderNumber}</div>
                        </div>

                        <div className="space-y-6 divide-y divide-stone-100">
                            {reviewsData.map((rev, index) => (
                                <div key={rev.productId} className={`${index > 0 ? "pt-6" : ""} space-y-3`}>
                                    <div className="font-semibold text-lg text-stone-800">
                                        {index + 1}. {rev.productName}
                                    </div>
                                    
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => handleUpdateReviewField(index, "rating", s)}
                                                className="hover:scale-110 transition-transform"
                                            >
                                                <Star 
                                                    size={28}
                                                    fill={rev.rating >= s ? "#facc15" : "none"}
                                                    className={rev.rating >= s ? "text-yellow-400" : "text-stone-300"}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* กล่องข้อความความคิดเห็น */}
                                    <textarea 
                                        value={rev.comment}
                                        onChange={(e) => handleUpdateReviewField(index, "comment", e.target.value)}
                                        rows={3}
                                        placeholder="เขียนความคิดเห็นเกี่ยวกับสินค้าชิ้นนี้..."
                                        className="w-full rounded-2xl border border-stone-200 p-3 outline-none focus:ring-2 focus:ring-stone-500/20 text-sm transition"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t pt-4">
                            <button
                                onClick={() => {
                                    setReviewModal(false);
                                    setSelectedOrder(null);
                                    setReviewsData([]);
                                }}
                                className="rounded-xl border border-stone-300 px-5 py-2.5 font-medium hover:bg-stone-50 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={submitReview}
                                className="rounded-xl bg-black px-5 py-2.5 font-medium text-white hover:bg-stone-800 transition"
                            >
                                ส่งรีวิวทั้งหมด
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}