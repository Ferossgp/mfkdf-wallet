import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, Link, useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createNewWallet } from "~/lib/mfkdf";
import { redirectWithPrivateKey } from "~/lib/session";

export async function action({ request, context }: ActionFunctionArgs) {
  const { MY_KV: myKv } = context.cloudflare.env
  const body = await request.formData();
  const password = body.get("password");
  const exists = await myKv.get("test");

  // if (exists) {
  //   return json({ status: 400, error: "User already exists" }, { status: 400 });
  // }

  if (password == null || typeof password !== "string") {
    return { status: 400, error: "Password is required" };
  }

  const { store, privateKey } = await createNewWallet({
    password: password,
  });

  await myKv.put("test", JSON.stringify(store));

  return redirectWithPrivateKey("/?index", privateKey, {}, context.cloudflare.env)
}

export default function RegisterForm() {
  return (
    <Form method="post" className="w-full h-screen flex items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Vitalik" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={"m@example.com"}
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}
