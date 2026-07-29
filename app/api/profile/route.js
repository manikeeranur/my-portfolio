import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Profile from "@/lib/models/Profile";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/profile — PUBLIC, no token required.
export async function GET() {
  try {
    await dbConnect();
    const profile = await Profile.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0 });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    return NextResponse.json(profile.toObject());
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/profile — JWT required. Creates the profile document.
export async function POST(req) {
  try {
    requireAuth(req);
    await dbConnect();
    const existing = await Profile.findOne();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Profile already exists. Use PUT to update." },
        { status: 409 }
      );
    }
    const data = await req.json();
    delete data._id;
    delete data.__v;
    const profile = await Profile.create(data);
    return NextResponse.json({ success: true, profile: profile.toObject() }, { status: 201 });
  } catch (err) {
    if (err?.status) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("POST /api/profile error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// PUT /api/profile — JWT required. Replaces the full profile document (upserts if missing).
export async function PUT(req) {
  try {
    requireAuth(req);
    await dbConnect();
    const data = await req.json();
    delete data._id;
    delete data.__v;
    delete data.createdAt;
    delete data.updatedAt;
    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true, runValidators: false }
    );
    return NextResponse.json({ success: true, profile: profile.toObject() });
  } catch (err) {
    if (err?.status) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("PUT /api/profile error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/profile — JWT required. Resets the profile back to empty.
export async function DELETE(req) {
  try {
    requireAuth(req);
    await dbConnect();
    await Profile.deleteMany({});
    return NextResponse.json({ success: true, message: "Profile deleted successfully" });
  } catch (err) {
    if (err?.status) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/profile error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
