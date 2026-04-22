import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Tokenomics", href: "#tokenomics" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between transition-all duration-500 rounded-2xl",
          scrolled && "bg-background/60 backdrop-blur-xl border border-border/60 px-4 py-3"
        )}
      >
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-violet-cyan grid place-items-center font-display font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
            L
          </div>
          <span className="font-display font-bold text-xl tracking-wide">LUVIA</span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 hover:after:w-full after:bg-primary after:transition-all"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button variant="hero" size="lg" asChild>
            <Link to="/buy">Buy $LUVIA</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg border border-border bg-card/60"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden container mt-3 animate-fade-in">
          <div className="glass-card p-6 flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base text-foreground/90 hover:text-primary"
              >
                {l.label}
              </a>
            ))}
            <Button variant="hero" asChild>
              <Link to="/buy" onClick={() => setOpen(false)}>Buy $LUVIA</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
