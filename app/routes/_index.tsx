import type { MetaFunction } from "@remix-run/cloudflare";
import { HomeScreen } from "~/components/home";
import { ClientOnly } from "remix-utils/client-only"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export default function Index() {
  return (
    <ClientOnly fallback={null}>
      {() => <HomeScreen />}
    </ClientOnly>
  );
}
