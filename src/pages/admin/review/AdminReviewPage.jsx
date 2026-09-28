import api from "../../../api/axios";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminReviewPage() {
    const [reviews, setReviews] = useState([]);

    async function loadReviews() {
        try {
            const res = await api.get("/api/admin/reviews");
            setReviews(res.data.data || []);
        }
        catch(err) {
            console.error(err);
        }
    }
    useEffect(() => {
        loadReviews();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const StarRating = ({ rating }) => (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((star) => (
                <Star
                    key={star}
                    size={14}
                    fill={rating >= star ? "#facc15" : "none"}
                    className={rating >= star ? "text-yellow-400" : "text-stone-300"}
                />
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <div className="text-3xl font-bold">รีวิวสินค้า</div>
                <div className="mt-1 text-sm text-stone-500">รีวิวและคะแนนจากลูกค้า</div>
            </div>

            {reviews.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white py-16 text-center text-stone-400 font-medium">
                    ยังไม่มีรีวิวสินค้า
                </div>
            ) : (
                <>
                    {/* 📱 Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {reviews.map((r) => (
                            <div key={r.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-semibold text-sm text-stone-900">{r.fullName || "-"}</div>
                                        <div className="text-xs text-stone-400">{r.email || "-"}</div>
                                    </div>
                                    <StarRating rating={r.rating} />
                                </div>

                                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1">
                                    <div className="text-xs text-stone-400 font-medium">สินค้า</div>
                                    <div className="text-sm font-semibold text-stone-800">{r.productName || "-"}</div>
                                </div>

                                {r.comment && (
                                    <div className="text-sm text-stone-600 bg-stone-50 rounded-xl p-3 border border-stone-100">
                                        <div className="text-xs text-stone-400 font-medium mb-1">รีวิว</div>
                                        <p className="line-clamp-3">{r.comment}</p>
                                    </div>
                                )}

                                <div className="text-xs text-stone-400 text-right">{formatDate(r.createdAt)}</div>
                            </div>
                        ))}
                    </div>

                    {/* 💻 Desktop Table View */}
                    <div className="hidden md:block overflow-hidden rounded-3xl border border-stone-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="min-w-[700px] w-full text-sm">
                                <thead className="bg-stone-50">
                                    <tr className="border-b border-stone-100 text-xs text-stone-500 font-semibold uppercase tracking-wider">
                                        <th className="px-5 py-4 text-left">ลูกค้า</th>
                                        <th className="px-5 py-4 text-left">สินค้า</th>
                                        <th className="px-5 py-4 text-left">คะแนน</th>
                                        <th className="px-5 py-4 text-left">รีวิว</th>
                                        <th className="px-5 py-4 text-left whitespace-nowrap">วันที่</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {reviews.map((r) => (
                                        <tr key={r.id} className="hover:bg-stone-50/50 transition">
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-stone-900">{r.fullName}</div>
                                                <div className="text-xs text-stone-500">{r.email}</div>
                                            </td>
                                            <td className="px-5 py-4 font-medium text-stone-800">
                                                {r.productName}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StarRating rating={r.rating} />
                                            </td>
                                            <td className="max-w-xs px-5 py-4 text-stone-600">
                                                {r.comment ? (
                                                    <span className="line-clamp-2" title={r.comment}>{r.comment}</span>
                                                ) : (
                                                    <span className="text-stone-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-stone-500 whitespace-nowrap">
                                                {formatDate(r.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}