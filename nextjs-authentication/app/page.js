import AuthForm from "@/components/auth-form";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }) {
  const result = await verifyAuth();

  if (result.user) {
    return redirect("/training");
  }
  const formMode = searchParams.mode || "login";
  return <AuthForm mode={formMode} />;
}
