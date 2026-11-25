import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Campaign Desk" }];
}

export default function Home() {
  return (
    <main>
      <h1>Campaign Desk</h1>
    </main>
  );
}
