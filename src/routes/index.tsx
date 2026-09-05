import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blank Page" },
      { name: "description", content: "An intentionally blank page." },
      { property: "og:title", content: "Blank Page" },
      { property: "og:description", content: "An intentionally blank page." },
    ],
  }),
  component: Index,
});

function Index() {
  return <main className="min-h-screen bg-background" />;
}
