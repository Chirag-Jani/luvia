const privacySections: Array<{
  title: string;
  body?: string[];
  bullets?: string[];
}> = [
  {
    title: "1. Introduction",
    body: [
      "Welcome to LUVIA (\"LUVIA\", \"we\", \"us\", or \"our\"), a decentralized AI compute infrastructure and digital asset ecosystem.",
      "This Privacy Policy governs collection, use, disclosure, storage, and protection of personal data in connection with the website, token presale/distribution, smart contract interactions, wallet integrations, APIs/tools, and communications channels.",
      "By accessing or using the Services, you acknowledge that you have read and agreed to this Privacy Policy.",
    ],
  },
  {
    title: "2. Definitions",
    bullets: [
      "Personal Data: information relating to an identified or identifiable individual",
      "Processing: any operation performed on Personal Data",
      "Data Subject: the individual to whom Personal Data relates",
      "Controller: entity determining purposes and means of processing",
      "Processor: third party processing data on behalf of Controller",
      "Blockchain Data: publicly available immutable data stored on distributed ledgers",
    ],
  },
  {
    title: "3. Applicability",
    body: [
      "This Policy applies to visitors, token purchasers/investors, wallet-connected users, developers/API users, and community participants interacting with LUVIA.",
      "It does not apply to decentralized blockchain networks or third-party platforms not controlled by LUVIA.",
    ],
  },
  {
    title: "4. Data Protection Principles",
    bullets: [
      "Lawfulness, fairness, and transparency",
      "Purpose limitation",
      "Data minimization",
      "Accuracy and data integrity",
      "Storage limitation",
      "Confidentiality and security",
      "Full accountability and auditability",
    ],
  },
  {
    title: "5. Categories of Data Collected",
    body: ["LUVIA may process the following categories of data:"],
    bullets: [
      "Identity and contact data (name, email, phone, country/jurisdiction)",
      "Financial and transaction data (wallet addresses, purchase and blockchain activity)",
      "Verification/compliance data where required (ID, proof of address, KYC/AML records)",
      "Technical and usage data (IP, device/browser/OS, logs, patterns, timestamps)",
      "Communication data (emails, tickets, chat messages, feedback)",
    ],
  },
  {
    title: "5.6 Blockchain Data Notice",
    body: ["Blockchain data is public, immutable, and outside LUVIA's control. LUVIA does not control ledger records but may associate wallet activity with user accounts where applicable."],
  },
  {
    title: "6. Legal Basis for Processing",
    bullets: [
      "Consent (marketing, optional features)",
      "Contractual necessity (token purchase/service delivery)",
      "Legal obligation (AML/KYC and compliance)",
      "Legitimate interests (fraud prevention, analytics, security)",
    ],
  },
  {
    title: "7. Purpose of Processing",
    bullets: [
      "Enable access to LUVIA ecosystem",
      "Facilitate token purchases and transactions",
      "Identity verification and compliance",
      "Fraud detection and prevention",
      "Platform analytics and optimization",
      "Customer support and communications",
      "Legal/regulatory compliance",
      "Security monitoring and incident response",
    ],
  },
  {
    title: "8. Data Sharing and Disclosure",
    body: ["LUVIA enforces a strict non-sale policy of personal data."],
    bullets: [
      "Authorized providers (hosting, payment, KYC/AML, analytics/security)",
      "Legal disclosures required by law or lawful requests",
      "Corporate transactions (merger/acquisition/asset transfer) under confidentiality obligations",
    ],
  },
  {
    title: "9. International Data Transfers",
    body: ["Data may be transferred across jurisdictions with safeguards such as contractual clauses, adequacy assessments, and secure handling protocols."],
  },
  {
    title: "10. Data Retention Policy",
    body: ["Personal data is retained only as long as necessary for operational, legal, and compliance purposes, then securely deleted or anonymized where possible."],
  },
  {
    title: "11. Security Measures",
    bullets: [
      "Encryption in transit and at rest",
      "Multi-layer authentication controls",
      "Secure key management",
      "Network isolation and firewalls",
      "Intrusion detection and continuous monitoring",
      "Periodic audits and penetration testing",
    ],
  },
  {
    title: "12. User Rights",
    body: [
      "Subject to applicable law, you may request access, correction, deletion, restriction, objection, portability, and withdrawal of consent.",
      "Requests can be submitted at info@luvia.exchange. Identity verification may be required.",
    ],
  },
  {
    title: "13. Blockchain and Web3 Limitations",
    bullets: [
      "Blockchain transactions are irreversible",
      "Data cannot be erased from decentralized networks",
      "Wallet addresses may be indirectly linked to identity",
      "LUVIA does not control third-party blockchain activity",
    ],
  },
  {
    title: "14. Cookies and Tracking Technologies",
    body: ["Cookies may be used for functionality, analytics, performance, and user experience. Users can manage cookies via browser preferences."],
  },
  {
    title: "15. Automated Processing and Profiling",
    body: ["Automated systems may be used for fraud detection, risk scoring, and compliance screening. No legally binding decisions are made without human review."],
  },
  {
    title: "16. Third-Party Services",
    body: ["Services may integrate with wallet providers, explorers, analytics tools, and external platforms. LUVIA is not responsible for third-party privacy practices."],
  },
  {
    title: "17. Children's Data",
    body: ["Services are not intended for individuals under 18. If such data is identified, it will be removed."],
  },
  {
    title: "18. Marketing and Communications",
    body: ["LUVIA may send updates, announcements, and ecosystem information. Users may opt out at any time."],
  },
  {
    title: "19. Data Breach Protocol",
    body: ["In case of breach, LUVIA will apply containment measures, assess risk, notify affected users where required, and inform regulators when applicable."],
  },
  {
    title: "20. Policy Updates",
    body: ["This Privacy Policy may be updated periodically. Continued use of Services after updates constitutes acceptance."],
  },
  {
    title: "21. Contact Information",
    body: ["For privacy inquiries, requests, or complaints: info@luvia.exchange"],
  },
  {
    title: "22. Compliance and Regulatory Positioning",
    body: ["This Privacy Policy is designed to align with GDPR-level principles, international privacy standards, and best practices for blockchain platforms."],
  },
  {
    title: "23. Risk Acknowledgment",
    body: ["By using LUVIA, you acknowledge the inherent risks of blockchain technology, transparent on-chain activity, and your responsibility to secure wallet access and private keys."],
  },
  {
    title: "24. Final Statement",
    body: ["LUVIA is committed to secure, transparent, and responsible handling of user data within the AI and digital asset ecosystem."],
  },
];

const Privacy = () => (
  <main className="min-h-screen bg-background text-foreground">
    <div className="container py-16 md:py-20 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-display font-bold">LUVIA Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">Effective Date: April 28, 2026</p>
      <p className="text-sm text-muted-foreground">Last Updated: April 28, 2026</p>

      <div className="mt-10 space-y-8">
        {privacySections.map((section) => (
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

export default Privacy;
