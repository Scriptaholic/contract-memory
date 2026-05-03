import { useState } from "react";

// ─── YOUR API KEY — replace this before deploying ───────────────────────────
const ANTHROPIC_API_KEY = "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"; // get it at console.anthropic.com

// ─── Sample Data ─────────────────────────────────────────────────────────────
const CONTRACTS = [
  {
    id: 1, vendor: "Salesforce", type: "SaaS Subscription", status: "Active",
    value: 480000, currency: "USD", startDate: "2024-01-15", endDate: "2026-07-15",
    renewalDays: 44, autoRenew: true, liabilityCap: 250000, noticeDays: 30,
    riskScore: 88, owner: "Marcus Chen", legalOwner: "Sarah Kim",
    flags: ["Auto-renewal in 44 days", "Liability cap below contract value", "Notice window closing"],
    clauses: [
      { title: "Auto-Renewal", text: "This Agreement shall automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least thirty (30) days prior to the end of the then-current term.", confidence: 97, risk: "high" },
      { title: "Liability Cap", text: "IN NO EVENT SHALL SALESFORCE'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE FEES PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.", confidence: 95, risk: "high" },
      { title: "Data Processing", text: "Salesforce will process Customer Data only in accordance with Customer's documented instructions.", confidence: 91, risk: "medium" },
      { title: "Termination for Convenience", text: "Either party may terminate this Agreement for convenience upon sixty (60) days prior written notice.", confidence: 89, risk: "low" },
      { title: "Price Escalation", text: "Salesforce reserves the right to increase fees upon renewal by no more than seven percent (7%) per annum.", confidence: 78, risk: "medium" },
    ],
    leverage: { score: 42, factors: ["Long-term customer (3 yrs)", "7% annual increase clause", "Competitor alternatives available", "Low switching cost — data export included"] },
    spend: [40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000, 40000],
  },
  {
    id: 2, vendor: "AWS", type: "Cloud Infrastructure", status: "Active",
    value: 1200000, currency: "USD", startDate: "2023-06-01", endDate: "2026-06-01",
    renewalDays: 31, autoRenew: false, liabilityCap: 1000000, noticeDays: 60,
    riskScore: 71, owner: "Priya Nair", legalOwner: "Sarah Kim",
    flags: ["Renewal decision needed in 31 days", "Usage-based pricing variance"],
    clauses: [
      { title: "Service Level Agreement", text: "AWS will use commercially reasonable efforts to make each AWS Service available with a Monthly Uptime Percentage of at least 99.99%.", confidence: 99, risk: "low" },
      { title: "Liability Limitation", text: "AWS's aggregate liability under this Agreement will not exceed the amount Customer paid to AWS in the twelve months preceding the claim.", confidence: 96, risk: "medium" },
      { title: "Data Residency", text: "Customer may specify the AWS Region(s) in which Customer Content will be stored and processed.", confidence: 94, risk: "low" },
      { title: "Termination", text: "Either party may terminate this Agreement for any reason with 30 days' notice.", confidence: 88, risk: "low" },
    ],
    leverage: { score: 61, factors: ["High spend = strong negotiating position", "Multi-year commitment opportunity", "Committed use discounts available", "Competing offers from Azure/GCP"] },
    spend: [95000, 98000, 102000, 99000, 101000, 97000, 103000, 100000, 98000, 101000, 103000, 103000],
  },
  {
    id: 3, vendor: "Acme Legal Services", type: "Professional Services", status: "Active",
    value: 180000, currency: "USD", startDate: "2025-01-01", endDate: "2026-12-31",
    renewalDays: 245, autoRenew: false, liabilityCap: 180000, noticeDays: 90,
    riskScore: 22, owner: "Sarah Kim", legalOwner: "Sarah Kim",
    flags: [],
    clauses: [
      { title: "Scope of Services", text: "Provider shall deliver legal advisory services as described in each Statement of Work executed between the parties.", confidence: 92, risk: "low" },
      { title: "Confidentiality", text: "Each party agrees to keep confidential all Confidential Information of the other party and not to disclose such information to any third party.", confidence: 96, risk: "low" },
      { title: "IP Ownership", text: "All deliverables produced under this Agreement shall be considered work made for hire and shall be the sole property of Client.", confidence: 83, risk: "medium" },
    ],
    leverage: { score: 78, factors: ["Relationship in good standing", "Renewals historically straightforward", "Market competitive rates"] },
    spend: [15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000],
  },
  {
    id: 4, vendor: "HubSpot", type: "SaaS Subscription", status: "Active",
    value: 96000, currency: "USD", startDate: "2024-03-01", endDate: "2025-09-01",
    renewalDays: -62, autoRenew: true, liabilityCap: 96000, noticeDays: 30,
    riskScore: 95, owner: "Marcus Chen", legalOwner: "Sarah Kim",
    flags: ["AUTO-RENEWAL TRIGGERED — notice window passed", "Contract overdue for review"],
    clauses: [
      { title: "Auto-Renewal", text: "Unless Customer provides notice of cancellation at least 30 days before the end of the subscription term, the subscription will automatically renew.", confidence: 97, risk: "high" },
      { title: "Fee Increases", text: "HubSpot may increase its fees for any renewal term upon 30 days' written notice.", confidence: 91, risk: "high" },
    ],
    leverage: { score: 28, factors: ["Auto-renewal already triggered", "Notice window has passed", "New contract term has begun"] },
    spend: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000],
  },
  {
    id: 5, vendor: "Stripe", type: "Payment Processing", status: "Active",
    value: 340000, currency: "USD", startDate: "2022-11-01", endDate: "2027-11-01",
    renewalDays: 548, autoRenew: false, liabilityCap: 500000, noticeDays: 90,
    riskScore: 15, owner: "Priya Nair", legalOwner: "Sarah Kim",
    flags: [],
    clauses: [
      { title: "Processing Fees", text: "Standard pricing of 2.9% + $0.30 per successful card charge applies unless a custom rate agreement is in effect.", confidence: 99, risk: "low" },
      { title: "Liability", text: "Stripe's aggregate liability for any claim arising under this agreement is limited to the greater of $500,000 or the fees paid in the prior 12 months.", confidence: 95, risk: "low" },
    ],
    leverage: { score: 85, factors: ["Long-term partnership", "Above-threshold volume for custom rates", "Stable relationship"] },
    spend: [28000, 29000, 27000, 31000, 28000, 30000, 29000, 28000, 31000, 27000, 30000, 28000],
  },
  {
    id: 6, vendor: "Notion", type: "SaaS Subscription", status: "Active",
    value: 24000, currency: "USD", startDate: "2025-02-01", endDate: "2026-02-01",
    renewalDays: 9, autoRenew: true, liabilityCap: 24000, noticeDays: 14,
    riskScore: 79, owner: "Marcus Chen", legalOwner: "Sarah Kim",
    flags: ["Auto-renewal in 9 days", "Short notice window (14 days)"],
    clauses: [
      { title: "Auto-Renewal", text: "Plans automatically renew unless cancelled at least 14 days before the billing date.", confidence: 94, risk: "high" },
      { title: "Data Export", text: "Upon termination, Customer may export all data within 30 days before data deletion.", confidence: 88, risk: "low" },
    ],
    leverage: { score: 55, factors: ["Low switching cost", "Competitors available (Confluence, Coda)", "Notice window still open — barely"] },
    spend: [2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000],
  },
];

const TOTAL_COMMITTED = CONTRACTS.reduce((s, c) => s + c.value, 0);
const AT_RISK = CONTRACTS.filter(c => c.renewalDays > 0 && c.renewalDays <= 90).reduce((s, c) => s + c.value, 0);
const TOP3_SPEND = [CONTRACTS[0], CONTRACTS[1], CONTRACTS[4]].reduce((s, c) => s + c.value, 0);
const CONCENTRATION = Math.round((TOP3_SPEND / TOTAL_COMMITTED) * 100);
const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

// ─── Risk Pulse ───────────────────────────────────────────────────────────────
function RiskPulse({ score }) {
  const color = score >= 80 ? "#e84040" : score >= 60 ? "#f59e0b" : score >= 30 ? "#3b82f6" : "#22c55e";
  const shouldPulse = score >= 60;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {shouldPulse && (
        <div style={{
          position: "absolute", width: 44, height: 44, borderRadius: "50%",
          background: color, opacity: 0.2, animation: "pulse 2s ease-out infinite",
        }} />
      )}
      <div style={{
        width: 36, height: 36, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, color: "#fff", position: "relative", zIndex: 1,
        boxShadow: shouldPulse ? `0 0 0 2px ${color}40` : "none",
      }}>
        {score}
      </div>
    </div>
  );
}

// ─── Confidence Badge ─────────────────────────────────────────────────────────
function ConfidenceBadge({ score }) {
  const color = score >= 90 ? "#22c55e" : score >= 80 ? "#3b82f6" : "#f59e0b";
  const label = score >= 90 ? "High confidence" : score >= 80 ? "Good" : "Review recommended";
  return (
    <span style={{
      fontSize: 10, padding: "2px 7px", borderRadius: 20,
      background: `${color}18`, color, border: `1px solid ${color}40`, fontWeight: 600,
    }}>
      {score}% · {label}
    </span>
  );
}

// ─── Persona Toggle ───────────────────────────────────────────────────────────
function PersonaToggle({ persona, setPersona }) {
  const personas = [
    { id: "legal", label: "Legal Counsel", icon: "⚖" },
    { id: "procurement", label: "Procurement", icon: "📋" },
    { id: "executive", label: "Executive", icon: "📊" },
  ];
  return (
    <div style={{ display: "flex", gap: 4, background: "#f3f4f6", borderRadius: 10, padding: 4 }}>
      {personas.map(p => (
        <button key={p.id} onClick={() => setPersona(p.id)} style={{
          padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
          background: persona === p.id ? "#fff" : "transparent",
          boxShadow: persona === p.id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
          fontWeight: persona === p.id ? 600 : 400,
          fontSize: 13, color: persona === p.id ? "#1a1a2e" : "#6b7280",
          transition: "all 0.15s",
        }}>
          <span style={{ marginRight: 5 }}>{p.icon}</span>{p.label}
        </button>
      ))}
    </div>
  );
}

// ─── Contract Card ────────────────────────────────────────────────────────────
function ContractCard({ contract, persona, onClick }) {
  const isRed = contract.riskScore >= 80;
  const isAmber = contract.riskScore >= 60 && contract.riskScore < 80;
  const borderColor = isRed ? "#fca5a5" : isAmber ? "#fcd34d" : "#e5e7eb";
  const bgColor = isRed ? "#fff8f8" : isAmber ? "#fffbeb" : "#fff";
  return (
    <div onClick={() => onClick(contract)} style={{
      background: bgColor, border: `1.5px solid ${borderColor}`,
      borderRadius: 12, padding: "16px 18px", cursor: "pointer",
      transition: "all 0.15s", marginBottom: 10,
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <RiskPulse score={contract.riskScore} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{contract.vendor}</span>
            <span style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 20 }}>{contract.type}</span>
            {contract.autoRenew && <span style={{ fontSize: 11, color: "#b45309", background: "#fef3c7", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>Auto-renew</span>}
          </div>
          {persona === "legal" && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
              Liability cap: <strong style={{ color: "#374151" }}>{fmt(contract.liabilityCap)}</strong> · Contract value: <strong>{fmt(contract.value)}</strong>
              {contract.liabilityCap < contract.value && <span style={{ color: "#dc2626", marginLeft: 6, fontWeight: 600 }}>⚠ Cap below contract value</span>}
            </div>
          )}
          {persona === "procurement" && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
              {contract.renewalDays < 0
                ? <span style={{ color: "#dc2626", fontWeight: 600 }}>🔴 Auto-renewed {Math.abs(contract.renewalDays)} days ago</span>
                : contract.renewalDays <= 90
                  ? <span style={{ color: contract.renewalDays <= 30 ? "#dc2626" : "#b45309", fontWeight: 600 }}>⏰ Renews in {contract.renewalDays} days</span>
                  : <span>Renews in {contract.renewalDays} days</span>
              }
              <span style={{ marginLeft: 10 }}>Annual value: <strong>{fmt(contract.value)}</strong></span>
            </div>
          )}
          {persona === "executive" && (
            <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
              Committed: <strong>{fmt(contract.value)}</strong> · Owner: {contract.owner}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>›</div>
      </div>
      {contract.flags.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {contract.flags.map((f, i) => (
            <span key={i} style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20,
              background: f.includes("TRIGGERED") ? "#fee2e2" : "#fff7ed",
              color: f.includes("TRIGGERED") ? "#b91c1c" : "#92400e",
              border: `1px solid ${f.includes("TRIGGERED") ? "#fca5a5" : "#fde68a"}`,
              fontWeight: 500,
            }}>{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Executive Metrics ────────────────────────────────────────────────────────
function ExecMetrics() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
      {[
        { label: "Total committed spend", value: fmt(TOTAL_COMMITTED), sub: "across 6 active contracts", color: "#1a1a2e" },
        { label: "Spend at renewal risk", value: fmt(AT_RISK), sub: "expiring within 90 days", color: "#b45309" },
        { label: "Vendor concentration", value: `${CONCENTRATION}%`, sub: "top 3 vendors by spend", color: CONCENTRATION > 60 ? "#dc2626" : "#374151" },
      ].map(m => (
        <div key={m.label} style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, fontWeight: 500 }}>{m.label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: m.color, lineHeight: 1.1 }}>{m.value}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{m.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Renewal Timeline ─────────────────────────────────────────────────────────
function RenewalTimeline({ contracts, onSelect }) {
  const upcoming = contracts.filter(c => c.renewalDays <= 120).sort((a, b) => a.renewalDays - b.renewalDays);
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 18px", marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>90-Day Renewal Radar</div>
      {upcoming.length === 0 ? (
        <div style={{ color: "#9ca3af", fontSize: 13 }}>No renewals in the next 90 days.</div>
      ) : (
        upcoming.map(c => {
          const pct = c.renewalDays < 0 ? 100 : Math.min(100, ((90 - c.renewalDays) / 90) * 100);
          const barColor = c.renewalDays < 0 ? "#dc2626" : c.renewalDays <= 30 ? "#f59e0b" : "#3b82f6";
          return (
            <div key={c.id} onClick={() => onSelect(c)} style={{ marginBottom: 12, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{c.vendor}</span>
                <span style={{ fontSize: 12, color: c.renewalDays < 0 ? "#dc2626" : "#6b7280", fontWeight: c.renewalDays < 0 ? 700 : 400 }}>
                  {c.renewalDays < 0 ? `Overdue ${Math.abs(c.renewalDays)}d` : `${c.renewalDays} days`} · {fmt(c.value)}
                </span>
              </div>
              <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Contract Deep Dive ───────────────────────────────────────────────────────
function ContractDeepDive({ contract, persona, onBack }) {
  const [activeTab, setActiveTab] = useState("clauses");
  const tabs = persona === "legal"
    ? [{ id: "clauses", label: "Clauses & Risk" }, { id: "obligations", label: "Obligations" }]
    : persona === "procurement"
      ? [{ id: "clauses", label: "Key Terms" }, { id: "leverage", label: "Leverage Analysis" }]
      : [{ id: "clauses", label: "Summary" }, { id: "spend", label: "Spend Profile" }];

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
      <div style={{ background: "#1a1a2e", padding: "20px 24px", color: "#fff" }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
          fontSize: 12, padding: "4px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 12,
        }}>← Back</button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{contract.vendor}</div>
            <div style={{ fontSize: 13, color: "#a5b4fc", marginTop: 2 }}>
              {contract.type} · {fmt(contract.value)} · Ends {contract.endDate}
            </div>
          </div>
          <RiskPulse score={contract.riskScore} />
        </div>
        {contract.flags.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {contract.flags.map((f, i) => (
              <span key={i} style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 20,
                background: "rgba(239,68,68,0.25)", color: "#fca5a5",
                border: "1px solid rgba(239,68,68,0.4)", fontWeight: 600,
              }}>{f}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "11px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400,
            color: activeTab === t.id ? "#1a1a2e" : "#6b7280",
            borderBottom: activeTab === t.id ? "2px solid #1a1a2e" : "2px solid transparent",
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 24px" }}>
        {activeTab === "clauses" && (
          <div>
            {contract.clauses.map((c, i) => (
              <div key={i} style={{
                marginBottom: 16, padding: "14px 16px",
                background: c.risk === "high" ? "#fff8f8" : c.risk === "medium" ? "#fffbeb" : "#f9fafb",
                borderRadius: 10,
                border: `1px solid ${c.risk === "high" ? "#fca5a5" : c.risk === "medium" ? "#fde68a" : "#e5e7eb"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{c.title}</span>
                  <ConfidenceBadge score={c.confidence} />
                </div>
                <p style={{ fontSize: 12, color: "#4b5563", margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>"{c.text}"</p>
                {c.confidence < 85 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "#92400e", background: "#fef3c7", padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                    ⚠ AI confidence below 85% — verify source clause before relying on this extraction
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {activeTab === "leverage" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Renegotiation leverage score</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: contract.leverage.score >= 60 ? "#16a34a" : contract.leverage.score >= 40 ? "#b45309" : "#dc2626" }}>
                  {contract.leverage.score}
                </div>
                <div>
                  <div style={{ height: 10, width: 200, background: "#e5e7eb", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${contract.leverage.score}%`, background: contract.leverage.score >= 60 ? "#16a34a" : "#f59e0b", borderRadius: 5 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>out of 100</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Key factors</div>
            {contract.leverage.factors.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, color: "#4b5563" }}>
                <span style={{ color: "#9ca3af", marginTop: 1 }}>›</span>{f}
              </div>
            ))}
          </div>
        )}
        {activeTab === "obligations" && (
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            <div style={{ marginBottom: 12, padding: "12px 14px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
              <strong style={{ color: "#166534" }}>No outstanding obligations detected</strong>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4b5563" }}>AI scanned all clauses for time-bound obligations. Next review triggered at 30 days pre-renewal.</p>
            </div>
          </div>
        )}
        {activeTab === "spend" && (
          <div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Monthly spend over last 12 months</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
              {contract.spend.map((v, i) => {
                const max = Math.max(...contract.spend);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "100%", background: "#3b82f6", borderRadius: "2px 2px 0 0", height: `${(v / max) * 70}px`, transition: "height 0.4s" }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#9ca3af" }}>
              {["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Query Bar ─────────────────────────────────────────────────────────────
function AIQueryBar({ contracts }) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const suggested = [
    "Which contracts auto-renew in the next 60 days?",
    "Which vendors have liability caps below $500K?",
    "What is our total SaaS spend this year?",
    "Show me all contracts with auto-renewal clauses",
  ];

  async function runQuery(q) {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer(null);
    const contractSummary = contracts.map(c => ({
      vendor: c.vendor, type: c.type, value: c.value,
      renewalDays: c.renewalDays, autoRenew: c.autoRenew,
      liabilityCap: c.liabilityCap, flags: c.flags,
    }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 600,
          system: `You are Contract Memory, an AI contract intelligence assistant. You have access to this company's contract portfolio. Answer questions concisely and specifically. Always cite which contracts you're referencing. Format your answer in 2-4 sentences maximum. If listing contracts, use a short bullet list. Contract data: ${JSON.stringify(contractSummary)}`,
          messages: [{ role: "user", content: q }],
        }),
      });
      const data = await res.json();
      setAnswer(data.content?.[0]?.text || "I couldn't find a clear answer in the contract data.");
    } catch {
      setAnswer("Query failed — check your API key and connection.");
    }
    setLoading(false);
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && runQuery(query)}
          placeholder='Ask anything... e.g. "Which contracts auto-renew this quarter?"'
          style={{
            width: "100%", padding: "12px 14px 12px 40px", borderRadius: 10,
            border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
            background: "#fff", boxSizing: "border-box", transition: "border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = "#6366f1"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
        <button onClick={() => runQuery(query)} style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 7,
          padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600,
        }}>Ask AI</button>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        {suggested.map((s, i) => (
          <button key={i} onClick={() => { setQuery(s); runQuery(s); }} style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 20,
            border: "1px solid #e5e7eb", background: "#f9fafb",
            color: "#6b7280", cursor: "pointer",
          }}>{s}</button>
        ))}
      </div>
      {loading && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: "#f3f4ff", borderRadius: 10, border: "1px solid #c7d2fe" }}>
          <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>🤖 Querying your contract portfolio…</div>
        </div>
      )}
      {answer && (
        <div style={{ marginTop: 12, padding: "14px 16px", background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd" }}>
          <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 700, marginBottom: 6 }}>AI Answer · Contract Memory</div>
          <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{answer}</div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>Powered by Claude · Results based on extracted contract data</div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [persona, setPersona] = useState("procurement");
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("risk");

  const sorted = [...CONTRACTS].sort((a, b) => {
    if (sortBy === "risk") return b.riskScore - a.riskScore;
    if (sortBy === "renewal") return (a.renewalDays < 0 ? 999 : a.renewalDays) - (b.renewalDays < 0 ? 999 : b.renewalDays);
    if (sortBy === "value") return b.value - a.value;
    return 0;
  });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#f8f9fc", minHeight: "100vh" }}>
      <style>{`
        @keyframes pulse { 0%{transform:scale(1);opacity:0.6} 70%{transform:scale(1.8);opacity:0} 100%{transform:scale(1.8);opacity:0} }
        * { box-sizing: border-box; }
        input::placeholder { color: #9ca3af; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#1a1a2e", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>Contract Memory</span>
          <span style={{ color: "#6366f1", fontSize: 11, background: "rgba(99,102,241,0.2)", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>BETA</span>
        </div>
        <PersonaToggle persona={persona} setPersona={setPersona} />
        <div style={{ fontSize: 12, color: "#64748b" }}>{CONTRACTS.length} active contracts</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 20px" }}>

        {persona === "executive" && !selected && <ExecMetrics />}
        {persona === "procurement" && !selected && <RenewalTimeline contracts={CONTRACTS} onSelect={setSelected} />}

        {selected ? (
          <ContractDeepDive contract={selected} persona={persona} onBack={() => setSelected(null)} />
        ) : (
          <>
            <AIQueryBar contracts={CONTRACTS} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>
                {persona === "legal" ? "Risk Portfolio" : persona === "procurement" ? "Contract Portfolio" : "All Contracts"}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {[{ v: "risk", l: "Risk" }, { v: "renewal", l: "Renewal" }, { v: "value", l: "Value" }].map(s => (
                  <button key={s.v} onClick={() => setSortBy(s.v)} style={{
                    padding: "5px 12px", borderRadius: 7, border: "1px solid #e5e7eb",
                    background: sortBy === s.v ? "#1a1a2e" : "#fff",
                    color: sortBy === s.v ? "#fff" : "#6b7280",
                    fontSize: 12, cursor: "pointer", fontWeight: sortBy === s.v ? 600 : 400,
                  }}>{s.l}</button>
                ))}
              </div>
            </div>

            {persona === "legal" && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "#991b1b", fontWeight: 700 }}>
                  ⚠ {CONTRACTS.filter(c => c.riskScore >= 80).length} contracts require legal review
                </span>
                <span style={{ fontSize: 12, color: "#b91c1c", marginLeft: 8 }}>
                  · {CONTRACTS.filter(c => c.liabilityCap < c.value).length} contracts have liability caps below contract value
                </span>
              </div>
            )}

            {sorted.map(c => (
              <ContractCard key={c.id} contract={c} persona={persona} onClick={setSelected} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
