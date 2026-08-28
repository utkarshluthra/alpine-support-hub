import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="text-center px-8">
        <div className="alpine-heading text-[8rem] leading-none text-muted-foreground/20">
          404
        </div>
        <div className="border-t border-border w-16 mx-auto mt-4 mb-6" />
        <h1 className="alpine-heading text-2xl">Not Found</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
          The page you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
