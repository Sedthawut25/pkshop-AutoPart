import React, { useEffect, useState } from 'react'

const API_BASE = '/api/customer'

export default function CustomerProfile() {
    const [isProfileLoading, setIsProfileLoading] = useState(false)
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
    })

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const getAuthHeaders = (includeJson = false) => {
        if (typeof window === 'undefined') {
            throw new TypeError('ไม่สามารถเข้าถึงข้อมูลผู้ใช้ได้')
        }

        const token = window.localStorage.getItem('pk_token')
        if (!token) {
            throw new Error('กรุณาเข้าสู่ระบบก่อน')
        }

        const headers = {
            Authorization: `Bearer ${token}`,
        }

        if (includeJson) {
            headers['Content-Type'] = 'application/json'
        }

        return headers
    }

    const getErrorMessage = (err) => (err instanceof Error ? err.message : 'มีข้อผิดพลาดเกิดขึ้น')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setErrorMsg("")
            setIsProfileLoading(true)

            const res = await fetch(`${API_BASE}/profile`, {
                headers: getAuthHeaders(),
            })

            if (!res.ok) {
                throw new Error('ไม่สามารถดึงข้อมูลโปรไฟล์ได้')
            }

            const data = await res.json()
            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
            })
        } catch (err) {
            setErrorMsg(getErrorMessage(err))
        } finally {
            setIsProfileLoading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        setSuccessMsg("")

        try {
            setIsProfileLoading(true)

            const res = await fetch(`${API_BASE}/profile`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(true),
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    phone: formData.phone,
                }),
            })

            if (!res.ok) {
                throw new Error('อัปเดตข้อมูลไม่สำเร็จ')
            }

            const data = await res.json()
            setSuccessMsg(data.message || 'อัปเดตข้อมูลส่วนตัวสำเร็จ')
        } catch (err) {
            setErrorMsg(getErrorMessage(err))
        } finally {
            setIsProfileLoading(false)
        }
    }

    const handleUpdatePassword = async (e) => {
        e.preventDefault()
        setErrorMsg("")
        setSuccessMsg("")

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMsg('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน')
            return
        }

        if (passwordData.newPassword.length < 8) {
            setErrorMsg('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร')
            return
        }

        try {
            setIsPasswordLoading(true)

            const res = await fetch(`${API_BASE}/profile/password`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(true),
                },
                body: JSON.stringify({
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword,
                }),
            })

            const responseData = await res.text()

            if (!res.ok) {
                throw new Error(responseData || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
            }

            setSuccessMsg('เปลี่ยนรหัสผ่านสำเร็จแล้ว!')
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setErrorMsg(getErrorMessage(err))
        } finally {
            setIsPasswordLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">จัดการบัญชีของฉัน</h1>

            {errorMsg && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200" role="alert" aria-live="polite">
                    {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200" role="status" aria-live="polite">
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-3">ข้อมูลส่วนตัว</h2>
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm text-gray-600 mb-1.5">อีเมล (ไม่สามารถเปลี่ยนได้)</label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="w-full border p-2.5 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="fullName" className="block text-sm text-gray-600 mb-1.5">ชื่อ-นามสกุล</label>
                            <input
                                id="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                                required
                                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm text-gray-600 mb-1.5">เบอร์โทรศัพท์</label>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                placeholder="เช่น 098xxxxxxx"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isProfileLoading}
                            className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800 transition-all font-medium disabled:bg-gray-400 mt-2"
                        >
                            {isProfileLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </form>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-3">เปลี่ยนรหัสผ่าน</h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm text-gray-600 mb-1.5">รหัสผ่านปัจจุบัน</label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))}
                                required
                                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm text-gray-600 mb-1.5">รหัสผ่านใหม่</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                                required
                                minLength={8}
                                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                placeholder="อย่างน้อย 8 ตัวอักษร"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                required
                                minLength={8}
                                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isPasswordLoading}
                            className="w-full bg-gray-200 text-black p-3 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:bg-gray-100 disabled:text-gray-400 mt-2"
                        >
                            {isPasswordLoading ? 'กำลังดำเนินการ...' : 'อัปเดตรหัสผ่าน'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}