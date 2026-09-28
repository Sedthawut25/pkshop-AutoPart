import { useEffect, useState } from "react";
import api from "../../../api/axios";

export default function AdminRequestPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // ฟังก์ชันช่วยจัดการรูปแบบวันที่จาก Spring Boot
    const formatDate = (dateValue) => {
        if (!dateValue) return '-';
        if (Array.isArray(dateValue)) {
            // กรณี Spring Boot ส่งมาเป็น Array: [ปี, เดือน, วัน, ชั่วโมง, นาที]
            const [year, month, day] = dateValue;
            return new Date(year, month - 1, day).toLocaleDateString('th-TH');
        }
        // กรณีส่งมาเป็น String ปกติ
        return new Date(dateValue).toLocaleDateString('th-TH');
    };

    const fetchRequest = async () => {
        try {
            const response = await api.get("/api/admin/requests");
            if (response.data) {
                setRequests(response.data);
            }
        }
        catch (err) {
            console.error("Error fetching", err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        if(!window.confirm(`ต้องการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่`)) return;

        try {
            const response = await api.put(`/api/admin/requests/${id}/status`, { status: newStatus });

            if(response.status === 200) {
                alert("อัปเดตสถานะเรียบร้อย");
                fetchRequest();
            }
            else {
                alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
            }
        }
        catch (err) {
            console.error("Error updating status: ", err);
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'PENDING' || status === 'OPEN') return 'bg-yellow-100 text-yellow-800';
        if (status === 'APPROVE') return 'bg-green-100 text-green-800';
        if (status === 'REJECTED') return 'bg-red-100 text-red-800';
        return 'bg-stone-100 text-stone-800';
    };

    const getStatusLabel = (status) => {
        if (status === 'OPEN') return 'เปิด';
        if (status === 'APPROVE') return 'อนุมัติแล้ว';
        if (status === 'REJECTED') return 'ปฏิเสธ';
        return status || 'PENDING';
    };

    if (loading) {
        return <div className="py-16 text-center text-stone-500">กำลังโหลดข้อมูล...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-stone-800">รีเควสสินค้าลูกค้า</h1>
                <p className="text-stone-500 text-sm mt-1">จัดการรายการอะไหล่ที่ลูกค้าแจ้งหรือต้องการสั่งพิเศษ</p>
            </div>

            {requests.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-stone-200 bg-white py-16 text-center text-stone-400 font-medium">
                    ยังไม่มีรีเควสสินค้าจากลูกค้า
                </div>
            ) : (
                <>
                    {/* 📱 Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {requests.map((req) => (
                            <div key={req.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-semibold text-sm text-stone-900">
                                            {req.customer?.fullName || req.customer?.email || req.customer?.id || 'N/A'}
                                        </div>
                                        <div className="text-xs text-stone-400 mt-0.5">{formatDate(req.createdAt)}</div>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusStyle(req.status)}`}>
                                        {getStatusLabel(req.status)}
                                    </span>
                                </div>

                                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2 text-xs">
                                    <div>
                                        <span className="text-stone-400">รายการอะไหล่: </span>
                                        <span className="font-semibold text-stone-800">{req.partName || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-stone-400">ยี่ห้อ/รุ่น: </span>
                                        <span className="font-medium text-stone-700">{req.carBrand || '-'} {req.carModel || ''}</span>
                                    </div>
                                    {req.description && (
                                        <div>
                                            <span className="text-stone-400">รายละเอียด: </span>
                                            <span className="text-stone-600">{req.description}</span>
                                        </div>
                                    )}
                                </div>

                                {(req.status === 'PENDING' || req.status === 'OPEN') && (
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <button
                                            onClick={() => handleUpdateStatus(req.id, 'APPROVE')}
                                            className="py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition border border-green-200 text-xs font-bold"
                                        >
                                            อนุมัติ
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                            className="py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200 text-xs font-bold"
                                        >
                                            ปฏิเสธ
                                        </button>
                                    </div>
                                )}
                                {(req.status !== 'PENDING' && req.status !== 'OPEN') && (
                                    <div className="text-center text-xs text-stone-400">ดำเนินการแล้ว</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 💻 Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-[800px] w-full divide-y divide-stone-200">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">วันที่แจ้ง</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">ลูกค้า</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">รายการอะไหล่</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider whitespace-nowrap">ยี่ห้อ/รุ่นรถ</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">รายละเอียด</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">สถานะ</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-stone-200">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                                {formatDate(req.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                                                {req.customer?.fullName || req.customer?.email || req.customer?.id || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-medium">
                                                {req.partName || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                                {req.carBrand || '-'} {req.carModel || ''}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500 max-w-xs truncate" title={req.description}>
                                                {req.description || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${getStatusStyle(req.status)}`}>
                                                    {getStatusLabel(req.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {(req.status === 'PENDING' || req.status === 'OPEN') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'APPROVE')}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition"
                                                        >
                                                            อนุมัติ
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition"
                                                        >
                                                            ปฏิเสธ
                                                        </button>
                                                    </>
                                                )}
                                                {(req.status !== 'PENDING' && req.status !== 'OPEN') && (
                                                    <span className="text-stone-400 text-xs">ดำเนินการแล้ว</span>
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
        </div>
    );
}