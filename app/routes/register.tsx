import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, Link, useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
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
import { createPrivateKeyHeaders } from "~/lib/session";
import QRCode from "react-qr-code";
import { s } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export async function action({ request, context }: ActionFunctionArgs) {
  const { MY_KV: myKv } = context.cloudflare.env
  const body = await request.formData();
  const password = body.get("password");
  const username = body.get("username");

  if (password == null || typeof password !== "string") {
    return json({ status: 400, error: "Password is required" }, { status: 400 })
  }

  if (username == null || typeof username !== "string") {
    return json({ status: 400, error: "Username is required" }, { status: 400 })
  }

  const id = username.toLowerCase()

  const exists = await myKv.get(id);

  if (exists) {
    return json({ status: 400, error: "User already exists" }, { status: 400 });
  }

  const session = body.get("session");

  if (session == null || typeof session !== "string") {
    return json({ status: 400, error: "Somethign wen't wrong" }, { status: 400 })
  }

  console.log(session);

  const { store, totp, privateKey } = await createNewWallet({
    password: password,
    session: session,
    username: username,
  });

  // NOTE: we can store this in IPFS or another decentralized storage
  await myKv.put(id, JSON.stringify(store));


  return json({ totp: totp }, {
    headers: await createPrivateKeyHeaders(privateKey, context.cloudflare.env),
    status: 200
  });

}

export default function RegisterForm() {
  const data = useActionData<typeof action>();
  useEffect(() => {
    if (data?.error) {
      toast.error(data.error);
    }
  }, [data?.error]);

  // Simple imitation of a browser session, to keep the user logged in
  const [sessionId, setSessionId] = useLocalStorage<string | null>(
    "session",
    null
  );

  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
  }, [sessionId, setSessionId]);

  if (data?.totp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Scan this QR code</CardTitle>
          <CardDescription>
            Scan this QR code with your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="text-center">{data.totp && <QRCode value={data.totp.uri} className="w-64 h-64 mt-4 mb-4" size={192} />}</div>
          <Button>
            <Link to="/">Done</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

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
          <input type="hidden" name="session" value={sessionId} />
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input name="username" id="username" placeholder="Vitalik" required />
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
