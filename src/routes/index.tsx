import { createFileRoute } from "@tanstack/react-router";
import { HumanDevice } from "@/components/human/HumanDevice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HUMAN — MIDI Humanizer" },
      {
        name: "description",
        content:
          "HUMAN is a MIDI humanizer plugin concept shaped like a handheld console: turn the knobs and the little pixel character gets drunk.",
      },
      { property: "og:title", content: "HUMAN — MIDI Humanizer" },
      {
        property: "og:description",
        content:
          "A handheld-console MIDI humanizer: HUMANIZE, TIMING and VELOCITY knobs, a seed D-pad, and a mascot that loses its balance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <HumanDevice />
      <p className="max-w-sm text-center font-pixel text-[8px] leading-[2] text-muted-foreground">
        DRAG THE KNOBS · D-PAD MOVES THE SEED · GENERATE MAKES A NEW FEEL
      </p>
    </main>
  );
}
