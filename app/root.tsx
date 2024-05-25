import { json, LinksFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import stylesheet from "~/globals.css?url";
import { combineHeaders, getPrivateKey } from "./lib/session";
import { usePrivateKeySession } from "./usePrivateKeySession";
import { Toaster } from "~/components/ui/sonner";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { privateKey, headers: toastHeaders } = await getPrivateKey(request, context.cloudflare.env)

  return json({
    privateKey,
    ENV: {},
  }, {
    headers: combineHeaders(toastHeaders),
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>()
  usePrivateKeySession(data?.privateKey)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="w-full h-screen flex items-center justify-center px-4">
          {children}
        </div>
        <Toaster closeButton position="top-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
