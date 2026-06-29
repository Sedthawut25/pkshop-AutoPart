import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function Success() {
    const [params] = useSearchParams();

    useEffect(() => {
        const orderId = params.get("orderId");

        fetch (
            `${import.meta.env.VITE_API_BASE_URL}/api/customer/orders/paid?orderId=${orderId}`,
            {
                method: "POST"
            }
        );
    }, []);

    return <h1>ชำระเงินสำเร็จ</h1>
}