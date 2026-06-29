import axios from "axios";
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";

export default function CustomerOrderDetailPage() {
    const {orderId} = useParams();
    const nav = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadOrders() {
        try {
            const token = localStorage.getItem("pk_token");

            const res = await axios.get(
                `http://localhost:8080/api/customer/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setOrder(res.data.data);
        }
        catch(err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    function statusBage(status) {
        switch (status) {
            case "PAID":
                return (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        ชำระแล้ว
                    </span>
                );
            
            case "PACKING":
                return (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                        กำลังแพ็ก
                    </span>
                );
            
            case "SHIPPED":
                return (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        จัดส่งแล้ว
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
        if(loading) {
            return (
                <div className="py-24 text-center text-stone-500">
                    กำลังโหลดรายละเอียดคำสั่งซื้อ....
                </div>
            );
        }
        if(order) {
            return (
                <div className="mx-auto max-w-6xl space-y-6">
                    <button
                        onClick={() => nav(-1)}
                        className="rounded-xl border border-stone-300 px-4 py-2 text-sm hover:bg-stone-50"
                    >
                        กลับ
                    </button>

                    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-sm text-stone-400">
                                    หมายเลขคำสั่งซื้อ
                                </div>
                                
                                <div className="mt-1 text-2xl font-bold">
                                    {order.orderNumber}
                                </div>

                                <div className="mt-2">
                                    {statusBage(order.status)}
                                </div>
                            </div>

                            <div className="text-sm text-stone-500">
                                วันที่สั่ง:
                                {" "}
                                {new Date(order.createdAt).toLocaleString("th-TH")}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-stone-200 bg-white shadow-sm">
                        <div className="border-b border-stone-100 px-6 py-4 text-lg font-bold">
                            รายการสินค้า
                        </div>

                        <div className="divide-y divide-stone-100">
                            {order.items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex flex-col gap-4 py-6 px-5 sm:flex-row sm:text-center sm:justify-between"
                                >
                                    <div>
                                        <div className="font-semibold">
                                            {item.productName}
                                        </div>
                                        <div className="mt-1 text-sm text-stone-500">
                                            จำนวน {item.qty} ชิ้น
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-stone-500">
                                            ฿ {Number(item.unitPrice).toLocaleString()}
                                            {" "} / ชิ้น
                                        </div>

                                        <div className="text-lg font-bold">
                                            ฿ {Number(item.lineTotal).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                            <div className="text-lg font-bold">
                                การจัดส่ง
                            </div>
                            <div className="mt-5 space-y-4 text-sm">
                                <InfoRow 
                                    label = "บริษัทขนส่ง"
                                    value = {order.shippingProvider || "-"}
                                />
                                <InfoRow 
                                    label = "หมายเลขติดตามพัสดุ"
                                    value = {order.trackingNumber || "-"}
                                />
                                <InfoRow 
                                    label = "ที่อยู่จัดส่ง"
                                    value = {order.shippingAddress || "-"}
                                />
                            </div>
                        </div>
                        
                        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                            <div className="text-lg font-bold">
                                สรุปราคา
                            </div>

                            <div className="mt-5 space-y-3">
                                <PriceRow 
                                    label = "ยอดรวมสินค้า"
                                    value = {order.subTotal}
                                />
                                <PriceRow 
                                    label = "ส่วนลด"
                                    value = {order.discount}
                                />
                                <PriceRow 
                                    label = "ค่าจัดส่ง"
                                    value = {order.shippingFee}
                                />
                                <div className="border-t border-dashed pt-4">
                                    <PriceRow 
                                        label = "ยอดสุทธิ"
                                        value = {order.grandTotal}
                                        big
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function InfoRow ({label, value}) {
            return (
                <div>
                    <div className="text-stone-400">
                        {label}
                    </div>
                    <div className="mt-1 font-medium break-words">
                        {value}
                    </div>
                </div>
            );
        }
        function PriceRow ({label, value, negative = false, big = false}) {
            return (
                <div className="flex items-center justify-between">
                    <div className="text-stone-500">
                        {label}
                    </div>

                    <div
                        className={`font-semibold ${
                            big ?  "text-2xl" : "text-base"
                        } ${negative ?  "text-red-500" : " "} `}
                    >
                        {negative ? "-" : ""}
                        ฿ {Number(value || 0 ).toLocaleString()}
                    </div>
                </div>
            );
        }
    }