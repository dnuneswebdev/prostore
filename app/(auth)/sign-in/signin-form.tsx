"use client";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {signInWithCredentials} from "@/lib/actions/user.actions";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {useActionState} from "react";
import {useFormStatus} from "react-dom";

const signInDefaultValues = {
  email: "",
  password: "",
};

const SignInForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [data, action] = useActionState(signInWithCredentials, {
    success: false,
    message: "",
  });

  const SignInButton = () => {
    const {pending} = useFormStatus();

    return (
      <Button className="w-full" variant="default" disabled={pending}>
        {pending ? "Signing In..." : "Sign In"}
      </Button>
    );
  };

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            defaultValue={signInDefaultValues.email}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="password"
            defaultValue={signInDefaultValues.password}
            required
          />
        </div>
        <div>
          <SignInButton />
        </div>

        {/*  */}
        {data && !data.success && (
          <div className="text-sm text-center text-destructive">
            {data.message}
          </div>
        )}

        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="link" target="_self">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignInForm;
