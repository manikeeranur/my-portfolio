import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await dbConnect();
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true, token: signToken(user), username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
