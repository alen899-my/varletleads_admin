import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { fname, lname, email, password } = await req.json();

    await connectDB();

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing)
      return new Response(JSON.stringify({ error: "Email already registered" }), { status: 400 });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    await User.create({
      fname,
      lname,
      email,
      password: hashed,
      role: "user", // Default
    });

    return new Response(
      JSON.stringify({ success: true, message: "Signup successful" }),
      { status: 201 }
    );
  } catch (error) {
   
    return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
  }
}
