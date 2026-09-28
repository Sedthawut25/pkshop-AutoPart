import {useQuery} from "@tanstack/react-query";
import {adminAccounting} from "../../../api/adminAccounting.js";
import Card from "../../../components/ui/Card.jsx";
import Badge from "../../../components/ui/Badge.jsx";

export default function AdminAccountingPage () {
    const {data, isLoading, isError} = useQuery({
        queryKey: ["admin-stripe-summary"],
        queryFn: () => adminAccounting.getStripeSummary(),
    });

    if (isError) {
        return <div className="p-3 text-sm text-rose-700">ไม่สามารถโหลดข้อมูลบัญชีจาก Stripe ได้</div>;
    }

    const  balance = data?.balance || { available: 0, pending: 0 };
    const  txns = data?.recentTransactions || [];

    //แปลงเวลา จาก stipe ให้เป้นวันที่ของไทย
    const formatDateTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-ink">บัญชีและการเงิน</h1>
                <p className="text-sm text-muted" >ภาพรวมยอดเงินและประวัติธุรกรรมของร้าน PKSHOP</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="p-6 border-l-4 border-l-green-500">
                    <div className="text-sm text-muted mb-1">ยอดเงินพร้อมให้ถอน</div>
                    <div className="text-3xl font-bold text-green-600">
                        ฿ {balance.available.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                    <div className="text-sm text-muted mt-2">ยอดเงินที่สามารถฌอนเข้าบัญชีธนาคารได้ทันที</div>
                </Card>

                <Card className="p-6 border-l-4 border-l-yellow-500">
                    <div className="text-sm text-muted mb-1">ยอดเงินรอดำเนินการ</div>
                    <div className="text-3xl font-bold text-yellow-600">
                        ฿ {balance.pending.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                    <div className="text-xs text-muted mt-2">ยอดเงินที่ลูกค้าชำระแล้ว แต่รอระบบเคลียร์</div>
                </Card>
            </div>

            {/* ตารางประวัติธุรกรรม */}
            <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-md font-semibold">รายการธุรกรรมล่าสุด</div>
                        <div className="text-xs text-muted">แสดง 20 รายการล่าสุด</div>
                    </div>
                </div>
                {/* 📱 Mobile Transaction Cards */}
                <div className="md:hidden divide-y divide-line">
                    {txns.map((txn) => {
                        const isRefund = txn.type === "payment_refund";
                        return (
                            <div key={txn.id} className="py-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-mono text-xs text-muted break-all">{txn.id}</div>
                                        <div className="text-[11px] text-stone-400 mt-0.5">{formatDateTime(txn.createdTimestamp)}</div>
                                    </div>
                                    <Badge tone={isRefund ? "red" : "green"}>
                                        {isRefund ? "คืนเงิน" : "รับชำระ"}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs">
                                    <div>
                                        <span className="text-muted block text-[10px]">ยอดรับ</span>
                                        <span className={`font-semibold ${isRefund ? "text-rose-600" : "text-ink"}`}>
                                            ฿{txn.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted block text-[10px]">ค่าธรรมเนียม</span>
                                        <span className="text-rose-500 font-medium">
                                            {txn.fee === 0 ? "-" : `฿${txn.fee.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-muted block text-[10px]">ยอดสุทธิ</span>
                                        <span className={`font-bold ${isRefund ? "text-rose-600" : "text-green-600"}`}>
                                            ฿{txn.net.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {txns.length === 0 && (
                        <div className="py-8 text-center text-sm text-muted">ยังไม่มีรายการธุรกรรม</div>
                    )}
                </div>

                {/* 💻 Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm text-left">
                        <thead className="text-xs text-muted bg-stone-50">
                            <tr className="border-y border-line">
                                <th className="py-3 px-4 font-medium">วันที่ / เวลา </th>
                                <th className="py-3 px-4 font-medium">รหัสอ้างอิง</th>
                                <th className="py-3 px-4 font-medium">ประเภท</th>
                                <th className="py-3 px-4 font-medium text-right">ยอดรับ</th>
                                <th className="py-3 px-4 font-medium text-right text-rose-500">ค่าธรรมเนียม</th>
                                <th className="py-3 px-4 font-medium text-right text-green-600">ยอดสุทธิ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txns.map((txn) => {
                                const isRefund= txn.type === "payment_refund";

                                return (
                                    <tr key={txn.id} className="border-b border-line hover:bg-stone-50/50" >
                                        <td className="py-3 px-4 whitespace-nowrap">{formatDateTime(txn.createdTimestamp)}</td>
                                        <td className="py-3 px-4 font-mono text-xs text-muted">{txn.id}</td>
                                        <td className="py-3 px-4">
                                            <Badge tone={isRefund ? "red" : "green"}>
                                                {isRefund ? "คืนเงิน (Refund)" : "รับชำระ"}
                                            </Badge>
                                        </td>
                                        <td className={`py-3 px-4 text-right font-medium ${isRefund ? "text-rose-600" : "text-ink"}`}>
                                            {txn.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="py-3 px-4 text-right text-rose-500">
                                            {txn.fee === 0 ? "-" : txn.fee.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td className={`py-3 px-4 text-right font-semibold ${isRefund ? "text-rose-600" : "text-green-600"}`}>
                                            {txn.net.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                );
                            })}
                            {txns.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-sm text-muted">
                                        ยังไม่มีรายการธุรกรรม
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}