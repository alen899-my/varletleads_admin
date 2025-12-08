import { Metadata } from "next";
import AllLeadsClient from "./AllLeadsClient";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table page for TailAdmin Tailwind CSS Admin Dashboard Template",
};

export default function BasicTables() {
  return <AllLeadsClient />;
}
