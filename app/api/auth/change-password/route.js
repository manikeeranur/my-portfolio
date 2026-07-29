import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function PUT(req) {
  try {
    const auth = requireAuth(req);
    await dbConnect();
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    const user = await User.findById(auth.id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }
    user.password = newPassword;
    await user.save();
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err?.status) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("Change password error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
