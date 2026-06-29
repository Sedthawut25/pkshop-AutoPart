import { useEffect, useState } from "react";
import { authStorage } from "../../../utils/authStorage";

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
            const response = await fetch("http://localhost:8080/api/admin/requests", {
                headers: {
                    Authorization: `Bearer ${authStorage.token()}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRequests(data);
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
            const response = await fetch(`http://localhost:8080/api/admin/requests/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authStorage.token()}`,
                },
                body: JSON.stringify({status: newStatus}),
            });

            if(response.ok) {
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

    if (loading) {
        return <div className="p-6 text-stone-500">กำลังโหลดข้อมูล...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-stone-800">รีเควสสินค้าลูกค้า</h1>
                <p className="text-stone-500 text-sm mt-1">จัดการรายการอะไหล่ที่ลูกค้าแจ้งหรือต้องการสั่งพิเศษ</p>
            </div>

            <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stone-200"> 
                        <thead className="bg-stone-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">วันที่แจ้ง</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">ลูกค้า</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">รายการอะไหล่</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">ยี่ห้อ/รุ่นรถ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">รายละเอียดเพิ่มเติม</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-stone-200">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-stone-50 transition-colors">
                                        
                                        {/* แก้ไขเรื่องวันที่ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                            {formatDate(req.createdAt)}
                                        </td>
                                        
                                        {/* แก้ไขให้ดึงชื่อ หรือ อีเมล หรือ ID มาโชว์ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                                            {req.customer?.fullName || req.customer?.email || req.customer?.id || 'N/A'}
                                        </td>
                                        
                                        {/* รายการอะไหล่ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-medium">
                                            {req.partName || '-'}
                                        </td>
                                        
                                        {/* ยี่ห้อ/รุ่นรถ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                            {req.carBrand || '-'} {req.carModel || ''}
                                        </td>
                                        
                                        <td className="px-6 py-4 text-sm text-stone-500 max-w-xs truncate" title={req.description}>
                                            {req.description || '-'}
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full
                                                ${(req.status === 'PENDING' || req.status === 'OPEN') ? 'bg-yellow-100 text-yellow-800' : 
                                                    req.status === 'APPROVE' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-stone-100 text-stone-800'  }`}>                                       
                                                {req.status === 'OPEN' ? 'เปิด' : req.status || 'PENDING'}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2"> 
                                            {/* เปลี่ยนเช็กเป็น OPEN หรือ PENDING เพราะ DB ตั้ง Default ว่า OPEN */}
                                            {(req.status === 'PENDING' || req.status === 'OPEN') && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'APPROVE')}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md"
                                                    >
                                                        อนุมัติ
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md"
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-stone-500"> 
                                        <p className="text-lg">ยังไม่มีรีเควสสินค้าจากลูกค้า</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}