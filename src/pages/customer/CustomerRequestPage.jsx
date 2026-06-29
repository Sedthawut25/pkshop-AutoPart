import { useEffect, useState } from "react"
import { authStorage } from "../../utils/authStorage";

export default function CustomerRequestPage() {
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState ({
        partName: "",
        carBrand: "",
        carModel: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    const formatDate = (dateValue) => {
        if (!dateValue) return '-';
        if (Array.isArray(dateValue)) {
            const [year, month, day] = dateValue;
            return new Date(year, month - 1, day).toLocaleDateString('th-TH');
        }
        return new Date(dateValue).toLocaleDateString('th-TH');
    };

    const fetchRequest = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/customer/requests", {
                headers: {
                    Authorization: `Bearer ${authStorage.token()}`,
                },
            });
            
            if(response.ok){
                const data = await response.json();
                console.log("📌 ข้อมูลที่ได้รับจาก API:", data); // พิมพ์ค่าออกมาดู
                
                // เช็กว่าข้อมูลที่ส่งมาเป็น Array โดยตรง หรือถูกห่อมาใน { data: [...] }
                if (Array.isArray(data)) {
                    setRequests(data);
                } else if (data && Array.isArray(data.data)) {
                    setRequests(data.data);
                } else if (data && Array.isArray(data.content)) {
                    setRequests(data.content); // กรณีใช้ Pageable ของ Spring Boot
                } else {
                    console.log("⚠️ รูปแบบข้อมูลไม่ตรงกับที่คาดไว้", data);
                    setRequests([]);
                }
            } else {
                console.error("❌ ดึงข้อมูลไม่สำเร็จ HTTP Status:", response.status);
            }
        }
        catch(err) {
            console.error("❌ Error fetching", err);
        }
    };

    useEffect(() => {
        fetchRequest();
    }, []);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/customer/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authStorage.token()}`,
                },
                body: JSON.stringify(formData),
            });

            if(response.ok) {
                alert("ส่งคำขออะไหล่เรียบร้อยแล้ว");
                setFormData({partName: "", carBrand: "", carModel: "", description: ""});
                fetchRequest(); // รีเฟรชตารางทันทีหลังส่งข้อมูลสำเร็จ
            }
            else {
                alert("เกิดข้อผิดพลาดในการส่งคำขอ โปรดลองอีกครั้ง");
            }
        }
        catch(err) {
            console.error("Error Submit" , err);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-stone-800">ส่งคำขออะไหล่</h1>
                <p className="text-stone-500 mt-2">หากค้นหาอะไหล่ไหนไม่เจอ สามารถแจ้งรายละเอียดให้ทางเราจัดการหาให้ได้</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ... (ส่วน Form คงเดิม ไม่มีการแก้ไข) ... */}
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-1 h-fit">
                    <h2 className="text-xl font-semibold mb-4">แบบฟอร์มแจ้งหาอะไหล่</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ชื่ออะไหล่ <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                name="partName"
                                value={formData.partName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-stone-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                                placeholder="ปั้มน้ำ แบตเตอรี่"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 ">ยี่ห้อรถ</label>
                                <input 
                                    type="text" 
                                    name="carBrand"
                                    value={formData.carBrand}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Honda"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 ">รุ่นรถ/ปี</label>
                                <input 
                                    type="text" 
                                    name="carModel"
                                    value={formData.carModel}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-stone-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Civic Fe 2023"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700">รายละเอียดเพิ่มเติม</label>
                            <textarea 
                                name="description" 
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="mt-1 block w-full rounded-md border-stone-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
                                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับอะไหล่ที่ต้องการ"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white p-2 rounded-md transition ${loading ? 'bg-stone-400' : 'bg-black hover:bg-stone-800'}`}
                        >
                            {loading ? "กำลังส่งข้อมูล..." : "ส่งคำขอ"}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">ประวัติการส่งคำขออะไหล่</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-stone-200">
                            <thead className="bg-stone-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">วันที่</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">ชื่ออะไหล่</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">ยี่ห้อ/รุ่น</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-stone-200">
                                {requests.length > 0 ? (
                                    requests.map((req) => (
                                        <tr key={req.id}>
                                            {/* 🛠️ เปลี่ยนมาเรียกใช้ formatDate */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                                {formatDate(req.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900 font-medium">{req.partName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                                                {req.carBrand} {req.carModel}
                                            </td>
                                            {/* 🛠️ ปรับสถานะให้รองรับ OPEN และแสดงข้อความให้ลูกค้าเข้าใจง่าย */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${(req.status === 'PENDING' || req.status === 'OPEN') ? 'bg-yellow-100 text-yellow-800' :
                                                            (req.status === 'APPROVE' || req.status === 'APPROVED') ? 'bg-green-100 text-green-800' : 
                                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-800'}`}>
                                                        {req.status === 'OPEN' ? 'กำลังดำเนินการ' : 
                                                         req.status === 'APPROVE' ? 'อนุมัติแล้ว' : 
                                                         req.status === 'REJECTED' ? 'ถูกปฏิเสธ' : req.status || 'รอดำเนินการ'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-stone-500">
                                            ไม่มีประวัติการขออะไหล่
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}