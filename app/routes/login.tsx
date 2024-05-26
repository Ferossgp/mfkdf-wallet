import { ActionFunctionArgs, json } from "@remix-run/cloudflare"
import { Form, Link, useActionData } from "@remix-run/react"
import { useEffect } from "react"
import { toast } from "sonner"
import { useLocalStorage } from "usehooks-ts"
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
  const username = body.get("username");
  const session = body.get("session");
  const totp = body.get("totp");

  if (session == null || typeof session !== "string") {
    return json({ status: 400, error: "Somethign wen't wrong" }, { status: 400 })
  }

  if (username == null || typeof username !== "string") {
    return json({ status: 400, error: "Username is required" }, { status: 400 })
  }

  if (password == null || typeof password !== "string") {
    return json({ status: 400, error: "Password is required" }, { status: 400 })
  }

  const { MY_KV: myKv } = context.cloudflare.env
  const store = await myKv.get(username.toLowerCase());

  if (!store) {
    return json({ status: 400, error: "User does not exist" }, { status: 400 });
  }

  const pk = await deriveWallet(JSON.parse(store), {
    password: password,
    session: session,
    username: username,
    totp: totp ? parseInt(totp as string) : undefined,
  })

  // TODO: Policy changes evry time we use a totp, thus we have to
  // persist the new one

  return redirectWithPrivateKey("/?index", pk, {}, context.cloudflare.env)
};

export default function LoginForm() {
  const data = useActionData<typeof action>();
  useEffect(() => {
    if (data?.error) {
      toast.error(data.error);
    }
  }, [data?.error]);

  const [sessionId] = useLocalStorage("session", "");

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
          <input type="hidden" name="session" value={sessionId} />
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Username</Label>
              <Input id="email" type="email" name="username" placeholder="Vitalik" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            {sessionId == "" &&
              <div className="grid gap-2">
                <Label htmlFor="password">One Time Password</Label>
                <Input id="totp" type="number" name="totp" required />
              </div>}
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
