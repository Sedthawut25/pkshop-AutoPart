import React from "react";
import { Link } from "react-router-dom";
import Modal from "../ui/Modal";

export default function CustomerLoginPrompt({
  open,
  onClose,
  title = "กรุณาเข้าสู่ระบบก่อนทำรายการ",
  description = "กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนใช้งานเมนูนี้",
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-muted">{description}</p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/customer/login"
          className="rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white"
        >
          เข้าสู่ระบบ
        </Link>
        <Link
          to="/customer/register"
          className="rounded-xl border border-line px-4 py-3 text-center text-sm font-semibold text-ink"
        >
          สมัครสมาชิก
        </Link>
      </div>
    </Modal>
  );
}