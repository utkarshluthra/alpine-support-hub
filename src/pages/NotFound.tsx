import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-8">
          <div className="swiss-heading text-[10rem] leading-none text-muted-foreground/20">
            404
          </div>
          <div className="border-t-2 border-foreground w-24 mx-auto mt-6 mb-6" />
          <h1 className="swiss-heading text-3xl lg:text-4xl">
            Not Found
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 bg-[var(--swiss-black)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:opacity-80 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
