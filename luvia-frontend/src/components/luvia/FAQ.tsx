import { Reveal } from "./Reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "What is LUVIA?", a: "LUVIA is a decentralized infrastructure token for the AI compute economy built on Solana." },
  { q: "How do I participate in the presale?", a: "Connect your Solana wallet, enter the amount of SOL you want to invest, and receive LUVIA tokens instantly." },
  { q: "Which wallets are supported?", a: "Phantom, Solflare, Backpack, and WalletConnect." },
  { q: "When will tokens be listed?", a: "Token listing details will be announced after the presale concludes." },
  { q: "Is the smart contract audited?", a: "Security audit details will be published before mainnet deployment." },
  { q: "What happens after the presale?", a: "Tokens are distributed, the compute marketplace launches, and Phase 2 begins." },
];

export const FAQ = () => (
  <section id="faq" className="py-24 sm:py-32">
    <div className="container max-w-4xl">
      <div className="text-center">
        <Reveal>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">
            Frequently asked <span className="text-gradient-violet">questions</span>
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.15}>
        <Accordion type="single" collapsible className="mt-12 space-y-4">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass-card border-border/60 px-6 data-[state=open]:border-primary/50 data-[state=open]:shadow-[var(--shadow-glow)] transition-all">
              <AccordionTrigger className="text-left font-display font-semibold text-lg hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </div>
  </section>
);
