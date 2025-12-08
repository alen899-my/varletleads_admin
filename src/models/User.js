import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }, // ✅ for admin/user role
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
