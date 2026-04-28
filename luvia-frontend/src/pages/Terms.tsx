const termsSections: Array<{
  title: string;
  body?: string[];
  bullets?: string[];
}> = [
  {
    title: "1. Introduction",
    body: [
      "These Terms of Service (\"Terms\") constitute a legally binding agreement between you (\"User\", \"you\") and LUVIA (\"LUVIA\", \"we\", \"us\", \"our\").",
      "They govern your access to and use of the LUVIA website, token presale mechanisms, smart contracts and blockchain integrations, APIs/applications/infrastructure, and any related services (collectively, the \"Services\").",
      "By using LUVIA, you agree to be fully bound by these Terms.",
    ],
  },
  {
    title: "2. Eligibility and Jurisdictional Restrictions",
    body: ["You represent and warrant that:"],
    bullets: [
      "You are 18 years or older",
      "You have full legal capacity",
      "You are not a Restricted Person",
    ],
  },
  {
    title: "2.1 Restricted Jurisdictions",
    body: ["The Services are not available to individuals or entities located in, or residents of:"],
    bullets: [
      "United States of America",
      "United Kingdom",
      "Canada",
      "People's Republic of China",
      "Singapore",
      "Any jurisdiction subject to comprehensive sanctions",
      "Any jurisdiction where token offerings or crypto services are restricted",
    ],
  },
  {
    title: "2.2 Sanctions Compliance",
    body: ["You confirm that you are not:"],
    bullets: [
      "Listed on any sanctions list (e.g., OFAC, EU sanctions lists)",
      "Acting on behalf of a sanctioned individual or entity",
    ],
  },
  {
    title: "2.3 Geolocation and Blocking",
    body: ["LUVIA may:"],
    bullets: [
      "Use IP detection and geofencing",
      "Require identity verification",
      "Restrict or terminate access without notice",
    ],
  },
  {
    title: "3. Nature of Services",
    body: [
      "LUVIA provides a decentralized infrastructure for AI compute and token utility.",
      "LUVIA is not a financial institution, broker-dealer, custodian, or investment advisor.",
    ],
  },
  {
    title: "4. Token Classification and Legal Position",
    body: ["The LUVIA Token is strictly a utility token and:"],
    bullets: [
      "Does not constitute a security, share, derivative, or financial instrument",
      "Does not grant ownership, equity, or governance rights",
      "Is not offered with expectation of profit",
      "Has not been approved by any regulatory authority",
    ],
  },
  {
    title: "5. Token Sale and Participation Disclaimer",
    body: [
      "Participation in any token sale is entirely voluntary, conducted at your own risk, and may be subject to eligibility screening.",
      "No prospectus or offering memorandum is being issued and you are not relying on any representation of future value.",
    ],
  },
  {
    title: "6. Comprehensive Risk Disclosure",
    body: ["You expressly accept risks including total loss, volatility, smart contract failure/exploitation, regulatory changes, liquidity constraints, cybersecurity incidents, and project execution risk."],
  },
  {
    title: "7. No Financial Advice",
    body: [
      "All information is for informational purposes only and does not constitute financial, legal, or tax advice.",
      "You are solely responsible for your decisions.",
    ],
  },
  {
    title: "8. No Custody / User-Controlled Assets",
    body: [
      "LUVIA does not hold or manage user funds, control wallets, or recover lost private keys.",
      "You are fully responsible for wallet security, key management, and transaction execution.",
    ],
  },
  {
    title: "9. User Obligations",
    bullets: [
      "Comply with all laws",
      "Provide accurate information",
      "Maintain account and wallet security",
      "Avoid prohibited activities",
    ],
  },
  {
    title: "10. Prohibited Activities",
    bullets: [
      "Fraud, money laundering, terrorism financing",
      "Market manipulation",
      "Smart contract exploitation",
      "Unauthorized system access",
      "Abusive bot usage",
      "Circumventing jurisdiction restrictions",
    ],
  },
  {
    title: "11. Compliance and KYC/AML Rights",
    bullets: [
      "Require identity verification at any time",
      "Freeze or restrict access",
      "Report suspicious activities",
      "Deny participation without explanation",
    ],
  },
  {
    title: "12. Fees and Transactions",
    bullets: [
      "All transactions are final and irreversible",
      "Blockchain fees are user responsibility",
      "No refunds unless required by law",
    ],
  },
  {
    title: "13. Intellectual Property",
    body: ["All LUVIA code, branding, designs, and documentation are protected by intellectual property laws."],
  },
  {
    title: "14. Third-Party Integrations",
    body: ["LUVIA is not responsible for wallet providers, blockchain networks, or external services."],
  },
  {
    title: "15. Disclaimer of Warranties",
    body: [
      "THE SERVICES ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE\".",
      "LUVIA disclaims all warranties, including uninterrupted availability, error-free operation, and security guarantees.",
    ],
  },
  {
    title: "16. Limitation of Liability",
    body: ["To the maximum extent permitted by law, LUVIA is not liable for loss of funds/tokens, lost profits/revenue, indirect damages, smart contract failures, or blockchain disruptions. Total liability is limited to the amount you paid (if any)."],
  },
  {
    title: "17. Indemnification",
    body: ["You agree to indemnify LUVIA against claims, damages, losses, and legal expenses arising from your use of the Services, violation of these Terms, or breach of laws."],
  },
  {
    title: "18. Force Majeure",
    body: ["LUVIA is not liable for outages or failures caused by events outside reasonable control, including cyberattacks, regulatory actions, natural disasters, and blockchain/network failures."],
  },
  {
    title: "19. Data and Privacy",
    body: ["Use of Services is subject to the LUVIA Privacy Policy."],
  },
  {
    title: "20. Suspension and Termination",
    body: ["LUVIA may suspend access, terminate accounts, or block transactions at its sole discretion without liability."],
  },
  {
    title: "21. Governing Law and Arbitration",
    body: [
      "These Terms are governed by international commercial law principles, excluding conflict-of-law rules.",
      "All disputes are resolved by binding arbitration in Singapore under internationally recognized arbitration rules.",
      "You waive any right to participate in class actions or bring collective claims.",
    ],
  },
  {
    title: "22. Regulatory Positioning",
    body: ["LUVIA operates under a decentralized technology model and does not assume regulatory classification as a financial intermediary."],
  },
  {
    title: "23. Amendments",
    body: ["We may update these Terms at any time. Continued use constitutes acceptance."],
  },
  {
    title: "24. Entire Agreement",
    body: ["These Terms constitute the entire agreement between you and LUVIA regarding the Services."],
  },
  {
    title: "25. Contact",
    body: ["For questions about these Terms, contact: info@luvia.exchange"],
  },
  {
    title: "26. Final Risk Acknowledgment",
    body: ["By using LUVIA, you acknowledge and accept the legal, technical, financial, and regulatory risks associated with blockchain technology and digital assets."],
  },
];

const Terms = () => (
  <main className="min-h-screen bg-background text-foreground">
    <div className="container py-16 md:py-20 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-display font-bold">LUVIA Terms of Service</h1>
      <p className="mt-4 text-sm text-muted-foreground">Effective Date: April 28, 2026</p>
      <p className="text-sm text-muted-foreground">Last Updated: April 28, 2026</p>

      <div className="mt-10 space-y-8">
        {termsSections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg md:text-xl font-semibold">{section.title}</h2>
            {section.body?.map((line) => (
              <p key={line} className="text-sm md:text-base text-foreground/90 leading-relaxed">
                {line}
              </p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-foreground/90 leading-relaxed">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  </main>
);

export default Terms;
