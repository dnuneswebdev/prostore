import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {APP_NAME} from "@/lib/constants";
import {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import SignInForm from "./signin-form";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
};

type SignInPageProps = {
  searchParams: Promise<{callbackUrl: string}>;
};

const SignInPage = async ({searchParams}: SignInPageProps) => {
  const {callbackUrl} = await searchParams; // This is the callback URL that the user will be redirected to after signing in

  const session = await auth();

  if (session) {
    return redirect(callbackUrl || "/"); // Redirect to the callback URL no caso do user tentar fazer um checkout sem estar logado. aí volta para a página anterior
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image
              src="/images/logo.svg"
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
              priority={true}
            />
          </Link>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
