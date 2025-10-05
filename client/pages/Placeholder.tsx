export default function Placeholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="px-4 pt-8 pb-20 flex flex-col items-center text-center gap-3">
      <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 glow-ring" />
      <h1
        className="text-xl font-semibold"
        style={{ fontFamily: "Poppins, Inter, sans-serif" }}
      >
        {title}
      </h1>
      <p className="text-foreground/70 text-sm max-w-[26ch]">
        {description ||
          "This screen will be implemented next. Continue prompting to fill in this page."}
      </p>
    </div>
  );
}
