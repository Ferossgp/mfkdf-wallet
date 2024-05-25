import { ActionFunctionArgs } from "@remix-run/cloudflare"
import { Form, Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { deriveWallet } from "~/lib/mfkdf"
import { redirectWithPrivateKey } from "~/lib/session"

export const action = async ({
  request,
  context
}: ActionFunctionArgs) => {
  const body = await request.formData();
  const password = body.get("password");
  const { MY_KV: myKv } = context.cloudflare.env

  const store = await myKv.get("test");

  if (!store || password == null || typeof password !== "string") {
    return false;
  }

  const pk = await deriveWallet(JSON.parse(store), {
    password: password,
  })

  return redirectWithPrivateKey("/?index", pk, {}, context.cloudflare.env)
};

export default function LoginForm() {
  return (
    <Form method="post" className="w-full h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            <Button className="w-full">Sign in</Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </Form>
  )
}
