import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";

export default function MyOrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    async function loadOrders() {
        try {
            const token = localStorage.getItem("pk_token");

            const res = await axios.get (
                "http://localhost:8080/api/customer/orders/active",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setOrders(res.data.data || []);
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

    function statusBadge(status) {
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

            case "FAILED":
                return (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        ชำระเงินล้มเหลว
                    </span>
                );

            default : 
                return (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                        {status}
                    </span>
                );
        }
    }

    function trackingUrl(provider, trackingNo) {
        if(!trackingNo) return "#";

        const p = (provider || "").toLowerCase();

        if (p.includes("flash")) {
            return `https://www.flashexpress.co.th/fle/tracking?se=${trackingNo}`;
        }

        if (p.includes("kerry")) {
            return `https://th.kerryexpress.com/th/track/?track=${trackingNo}`;
        }

        if (p.includes("j&t")) {
            return `https://www.jtexpress.co.th/index/query/gzquery.html?bills=${trackingNo}`;
        }

        if (p.includes("dhl")) {
            return `https://www.dhl.com/th-th/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNo}`;
        }
        return "#";
    }
    if(loading) {
        return(
            <div className="py-24 text-center text-stone-500">
                กำลังโหลดคำสั่งซื้อ.....
            </div>
        );
    }

    return (
        <div className="max-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-2xl font-bold sm:text-3xl">
                        คำสั่งซื้อของฉัน
                    </div>
                    <div className="mt-1 text-sm text-stone-500">
                        ดูสถานะคำสั่งซื้อ และติดตามพัสดุ
                    </div>
                </div>
                <div className="rounded-2xl bg-stone-100 py-4 px-2 text-sm text-stone-600">
                    ทั้งหมด{orders.length} รายการ
                </div>
            </div>
            {orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500 ">
                    ยังไม่มีคำสั่งซื้อ
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((o) => (
                        <div
                            key={o.id}
                            onClick={() => nav(`/customer/orders/${o.id}`)}
                            className="overflow-hidden rounded-3xl border border-stone-200 p-5 bg-white shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:-[1.02]"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-stone-400">
                                        หมายเลขคำสั่งซื้อ
                                    </div>

                                    <div className="break-all text-lg font-bold sm:text-xl">
                                        {o.orderNumber}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {statusBadge(o.status)}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="grid gap-5 lg:grid-cols-2">
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Inbox 
                                                title = "วันที่ส่ง"
                                                value={new Date(o.createdAt).toLocaleDateString("th-TH")}
                                            />
                                            <Inbox 
                                                title = "ยอดรวม"
                                                value = {`฿${Number(
                                                    o.grandTotal
                                                ).toLocaleString()}`}
                                                big
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Inbox 
                                                title = "บริษัทขนส่ง"
                                                value = {o.shippingProvider || "-"}
                                            />
                                             <Inbox 
                                                title = "สถานะล่าสุด"
                                                value = {o.status}
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-x-stone-200 bg-stone-50 p-4">
                                        <div className="text-sm font-semibold">
                                            หมายเลขติดตามพัสดุ
                                        </div>
                                        <div className="mt-3 break-all text-base font-bold">
                                            {o.trackingNumber || "-"}
                                        </div>
                                        {o.trackingNumber && (
                                            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                                                <button
                                                    onClick={() => 
                                                        navigator.clipboard.writeText(
                                                            o.trackingNumber
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-white sm:w-auto"
                                                >
                                                    Copy
                                                </button>
                                                <a 
                                                    href={trackingUrl (
                                                        o.shippingProvider,
                                                        o.trackingNumber
                                                    )}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="w-full rounded-xl bg-black px-4 py-2 text-center text-sm font-medium text-white hover:bg-stone-800 sm:w-auto"
                                                >
                                                    ติดตามพัสดุ
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        );   
    }
    function Inbox ({title, value, big = false }) {
        return (
            <div className="rounded-2xl border border-stone-200  bg-white p-4">
                <div className="text-sm text-stone-400">
                    {title}
                </div>

                <div
                    className={`mt-1 break-words font-semibold ${
                        big ?  "text-xl" : "text-base"
                    }`}                
                >
                    {value}
                </div>
            </div>
        );
    }