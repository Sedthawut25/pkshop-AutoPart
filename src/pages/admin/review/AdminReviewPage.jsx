import axios from "axios";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminReviewPage() {
    const [reviews, setReviews] = useState([]);

    async function loadReviews() {
        try {
            const token = localStorage.getItem("pk_token");

            const res = await axios.get(
                "http://localhost:8080/api/admin/reviews",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setReviews(res.data.data || []);
        }
        catch(err) {
            console.error(err);
        }
    }
    useEffect(() => {
        loadReviews();
    }, []);
 
    return (
        <div className="space-y-6">
            <div>
                <div className="text-3xl font-bold">
                    รีวิวสินค้า
                </div>
                <div className="mt-1 text-sm text-stone-500">
                    รีวิวและคะแนนจากลูกค้า
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-stone-50">
                            <tr>
                                <th className="px-5 py-4 text-left">ลูกค้า</th>
                                <th className="px-5 py-4 text-left">สินค้า</th>
                                <th className="px-5 py-4 text-left">คะแนน</th>
                                <th className="px-5 py-4 text-left">รีวิว</th>
                                <th className="px-5 py-4 text-left">วันที่</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-t"
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-medium">
                                            {r.fullName}
                                        </div>
                                        <div className="text-xs text-stone-500">
                                            {r.email}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-medium">
                                        {r.productName}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            {[1,2,3,4,5].map((star) => (
                                                <Star 
                                                    key={star}
                                                    size={16}
                                                    fill={r.rating >= star ? "#facc15": "none"}
                                                    className={r.rating >= star ? "text-yellow-400" : "text-stone-300"}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="max-w-sm px-5 py-4 text-stone-700">
                                        {r.comment ? (
                                            <span className="line-clamp-2 " title={r.comment}> {r.comment}</span>
                                        ) : (
                                            <span className="text-stone-400"></span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-stone-500 whitespace-nowrap">
                                        {new Date(r.createdAt).toLocaleDateString("th-TH",{
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}