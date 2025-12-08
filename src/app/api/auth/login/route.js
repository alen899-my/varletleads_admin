import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return Response.json(
      {
        token,
        user: {
          id: user._id.toString(),
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
