import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Send, Twitter } from "lucide-react";

export const Footer = () => (
  <footer className="pt-20 pb-10 border-t border-border/60 relative">
    <div className="container">
      <div className="grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src="/logo_tp.png" alt="LUVIA" className="w-16 h-16" />
            <span className="font-display font-bold text-xl">LUVIA</span>
          </div>
          <p className="mt-4 text-muted-foreground max-w-sm">
            The infrastructure token for the AI compute economy.
          </p>
          <div className="mt-6 flex gap-3">
            {[Twitter, Send, BookOpen].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-xl glass-card grid place-items-center hover:border-primary/60 hover:text-primary-glow transition"
                aria-label="social"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Resources
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href="#about"
                className="text-foreground/80 hover:text-primary"
              >
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground/80 hover:text-primary">
                Whitepaper
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground/80 hover:text-primary">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground/80 hover:text-primary">
                Privacy
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Stay Updated
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="you@email.com"
              className="bg-secondary/50 border-border/60"
            />
            <Button variant="hero" size="default">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-14 pt-8 border-t border-border/60 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-muted-foreground">
        <span>© 2025 LUVIA Network. All Rights Reserved.</span>
        <span>Built on Solana</span>
      </div>
    </div>
  </footer>
);
