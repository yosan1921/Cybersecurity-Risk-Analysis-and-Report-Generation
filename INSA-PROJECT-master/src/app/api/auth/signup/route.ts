import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, name } = await req.json();

    // Add input validation
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Enhanced password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["Director", "Division Head", "Risk Analyst", "Staff"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      name: name || "",
    });

    await user.save();

    return NextResponse.json(
      { success: true, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

