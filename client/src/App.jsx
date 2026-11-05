import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, CheckCircle2, ClipboardList, History, LockKeyhole, LogOut, Moon, Search, Shield, Sun, UserRound, X } from "lucide-react";
import api from "./api";
import { getStoredValue, removeStoredValue, setStoredValue } from "./storage";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-teal-400 dark:focus:ring-teal-950";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-teal-500 dark:text-zinc-950 dark:hover:bg-teal-400";
const ghostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800";
const badgeClass =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold";

const networkLabels = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum ERC20",
  litecoin: "Litecoin",
  tron: "Tron TRC20",
  bsc: "BNB Smart Chain BEP20",
  polygon: "Polygon PoS"
};

const currencyOptions = [
  { id: "usdt", label: "USDT", networks: ["tron", "ethereum", "bsc", "polygon"] },
  { id: "btc", label: "BTC", networks: ["bitcoin"] },
  { id: "eth", label: "ETH", networks: ["ethereum"] },
  { id: "ltc", label: "LTC", networks: ["litecoin"] }
];

function App() {
  const [dark, setDark] = useState(() => getStoredValue("theme") === "dark");
  const [admin, setAdmin] = useState(() => readSavedAdmin());
  const [page, setPage] = useState(() => window.location.hash.replace("#", "") || "verify");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    setStoredValue("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const onHashChange = () => setPage(window.location.hash.replace("#", "") || "verify");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function logout() {
    removeStoredValue("adminToken");
    removeStoredValue("adminUser");
    setAdmin(null);
  }

  const activePage = ["verify", "history", "refund", "admin"].includes(page) ? page : "verify";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Security Notice: All transaction activity is currently paused while this portal is under compliance and cyber safety review.
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <a href="#verify" className="flex items-center gap-2 text-base font-bold">
            <Shield className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            Crypto Refund Portal
          </a>
          <nav className="flex flex-wrap items-center gap-2">
            <NavItem page="verify" activePage={activePage} icon={<Search className="h-4 w-4" />} label="Verify" />
            <NavItem page="history" activePage={activePage} icon={<History className="h-4 w-4" />} label="History" />
            <NavItem page="refund" activePage={activePage} icon={<ClipboardList className="h-4 w-4" />} label="Refund" />
            <NavItem page="admin" activePage={activePage} icon={<BarChart3 className="h-4 w-4" />} label="Admin" />
            <button aria-label="Toggle theme" className={ghostButtonClass} onClick={() => setDark((value) => !value)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {admin && (
              <button className={ghostButtonClass} onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-teal-700 dark:text-teal-300">Secure Refund Operations</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Track crypto withdrawals, save refund requests, and review every case from one dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`${badgeClass} border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300`}>Saved Data</span>
              <span className={`${badgeClass} border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300`}>USDT Ready</span>
              <span className={`${badgeClass} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300`}>Admin Review</span>
            </div>
          </div>
        </section>
        {activePage === "verify" && <VerifyPage />}
        {activePage === "history" && <HistoryPage />}
        {activePage === "refund" && <RefundPage />}
        {activePage === "admin" && <AdminPage admin={admin} setAdmin={setAdmin} />}
      </main>
    </div>
  );
}

function readSavedAdmin() {
  try {
    const raw = getStoredValue("adminUser");
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    removeStoredValue("adminUser");
    removeStoredValue("adminToken");
    return null;
  }
}

function NavItem({ page, activePage, icon, label }) {
  const isActive = activePage === page;
  return (
    <a
      href={`#${page}`}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-normal md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
    </div>
  );
}

function VerifyPage() {
  const [form, setForm] = useState({ txid: "", walletAddress: "", currency: "usdt", network: "tron", requestedAmount: "" });
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedCurrency = currencyOptions.find((item) => item.id === form.currency);
  const availableNetworks = useMemo(() => selectedCurrency?.networks || ["tron"], [selectedCurrency]);

  useEffect(() => {
    if (!availableNetworks.includes(form.network)) {
      setForm((value) => ({ ...value, network: availableNetworks[0] }));
    }
  }, [availableNetworks, form.network]);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setTransaction(null);
    try {
      const { data } = await api.post("/transactions/verify", form);
      setTransaction(data.transaction);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageTitle title="Verify Transaction" subtitle="USDT, BTC, ETH, and LTC transaction review with network-aware forms." />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <Metric label="USDT Networks" value="4" tone="emerald" />
        <Metric label="Currencies" value="4" tone="amber" />
        <Metric label="Review Mode" value="Live" tone="emerald" />
        <Metric label="Admin Queue" value="Ready" tone="rose" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form onSubmit={submit} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 rounded-md bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
            Select the exact asset and chain before entering TXID. USDT TRC20 can be checked live; other token chains are saved for manual department review.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Currency">
              <select className={inputClass} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {currencyOptions.map((currency) => (
                  <option key={currency.id} value={currency.id}>{currency.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Network">
              <select className={inputClass} value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })}>
                {availableNetworks.map((network) => (
                  <option key={network} value={network}>{networkLabels[network]}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Transaction Hash">
            <input className={inputClass} value={form.txid} onChange={(e) => setForm({ ...form, txid: e.target.value })} required />
          </Field>
          <Field label="Receiver Wallet Address">
            <input className={inputClass} value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} required />
          </Field>
          <Field label="Amount">
            <input type="number" min="0" step="0.000001" className={inputClass} value={form.requestedAmount} onChange={(e) => setForm({ ...form, requestedAmount: e.target.value })} required />
          </Field>
          {error && <Alert tone="error">{error}</Alert>}
          <button className={buttonClass} disabled={loading}>
            <Search className="h-4 w-4" />
            {loading ? "Verifying..." : "Verify Status"}
          </button>
        </form>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-semibold">Transaction Details</h2>
          {transaction ? <TransactionDetails transaction={transaction} /> : <EmptyState text="Verified transaction data will appear here." />}
        </section>
      </div>
    </>
  );
}

function TransactionDetails({ transaction }) {
  const rows = [
    ["Sender", transaction.sender],
    ["Receiver", transaction.receiver],
    ["Amount", transaction.amount],
    ["Entered Amount", transaction.requestedAmount || "-"],
    ["Currency", transaction.currency],
    ["Network", transaction.network],
    ["Block Number", transaction.blockNumber || "Pending"],
    ["Confirmations", transaction.confirmations],
    ["Status", transaction.rawStatus || (transaction.confirmed ? "Confirmed" : "Pending")]
  ];

  return (
    <div className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-1 rounded-md bg-zinc-50 p-3 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
          <span className="break-all text-sm font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}

function RefundPage() {
  const emptyForm = { name: "", email: "", transactionHash: "", walletAddress: "", currency: "USDT", network: "Tron TRC20", withdrawalAmount: "", reason: "" };
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/refunds", form);
      setMessage("Refund request submitted successfully.");
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit request");
    }
  }

  return (
    <>
      <PageTitle title="Withdrawal Refund Request" subtitle="Set your currency, network, wallet, transaction hash, and exact withdrawal amount." />
      <form onSubmit={submit} className="max-w-3xl rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 rounded-md border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950">
          <div className="text-sm font-bold text-teal-800 dark:text-teal-200">Refund Department Intake</div>
          <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
            Your submitted details are saved and visible to the admin dashboard for approval or rejection.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="Currency">
            <select className={inputClass} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option>USDT</option>
              <option>BTC</option>
              <option>ETH</option>
              <option>LTC</option>
            </select>
          </Field>
          <Field label="Network">
            <select className={inputClass} value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })}>
              <option>Tron TRC20</option>
              <option>Ethereum ERC20</option>
              <option>BNB Smart Chain BEP20</option>
              <option>Polygon PoS</option>
              <option>Bitcoin</option>
              <option>Litecoin</option>
            </select>
          </Field>
          <Field label="Withdrawal Amount">
            <input type="number" min="0" step="0.000001" className={inputClass} value={form.withdrawalAmount} onChange={(e) => setForm({ ...form, withdrawalAmount: e.target.value })} required />
          </Field>
          <Field label="Wallet Address">
            <input className={inputClass} value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} required />
          </Field>
        </div>
        <Field label="Transaction Hash">
          <input className={inputClass} value={form.transactionHash} onChange={(e) => setForm({ ...form, transactionHash: e.target.value })} required />
        </Field>
        <Field label="Refund Department Service">
          <textarea
            className={`${inputClass} min-h-32`}
            placeholder="Describe your refund or withdrawal issue for the refund department."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
        </Field>
        {message && <Alert tone="success">{message}</Alert>}
        {error && <Alert tone="error">{error}</Alert>}
        <button className={buttonClass}>
          <CheckCircle2 className="h-4 w-4" />
          Submit Request
        </button>
      </form>
    </>
  );
}

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/transactions/history")
      .then(({ data }) => setHistory(data.history))
      .catch((err) => setError(err.response?.data?.message || "Could not load history"));
  }, []);

  return (
    <>
      <PageTitle title="Transaction History" subtitle="Recent verifications are saved here for quick follow-up." />
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-6">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <tr>
                  {["Hash", "Wallet", "Currency", "Network", "Entered", "Verified", "Status", "Action"].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const isSelected = (selected?._id || selected?.txid) === (item._id || item.txid);

                  return (
                  <tr key={item._id || item.txid} className={`border-t border-zinc-200 dark:border-zinc-800 ${isSelected ? "bg-teal-50 dark:bg-teal-950/40" : ""}`}>
                    <td className="max-w-64 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <button className={ghostButtonClass} onClick={() => setSelected(item)}>Details</button>
                        <span className="break-all pt-2">{item.txid}</span>
                      </div>
                    </td>
                    <td className="max-w-56 break-all px-4 py-3">{item.walletAddress}</td>
                    <td className="px-4 py-3">{item.currency || "-"}</td>
                    <td className="px-4 py-3">{item.network}</td>
                    <td className="px-4 py-3">{item.requestedAmount || "-"}</td>
                    <td className="px-4 py-3">{item.amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={item.rawStatus || (item.confirmed ? "approved" : "pending")} /></td>
                    <td className="px-4 py-3">
                      <button className={buttonClass} onClick={() => setSelected(item)}>View Full Details</button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {history.length === 0 && <EmptyState text="No records found." />}
        </div>
      </div>
      {selected && <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) {
    return null;
  }

  const details = [
    ["Transaction Hash", transaction.txid],
    ["Wallet Address", transaction.walletAddress],
    ["Currency", transaction.currency || "-"],
    ["Network", transaction.network],
    ["Entered Amount", transaction.requestedAmount || "-"],
    ["Verified Amount", transaction.amount ?? "-"],
    ["Sender", transaction.sender || "-"],
    ["Receiver", transaction.receiver || "-"],
    ["Block Number", transaction.blockNumber || "Pending"],
    ["Confirmations", transaction.confirmations ?? "-"],
    ["Status", transaction.rawStatus || (transaction.confirmed ? "confirmed" : "pending")],
    ["Saved At", transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : "-"]
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Transaction Full Details</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Selected history record</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={transaction.rawStatus || (transaction.confirmed ? "approved" : "pending")} />
            <button className={ghostButtonClass} onClick={onClose} aria-label="Close details">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-950">
              <div className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{label}</div>
              <div className="mt-1 break-all text-sm font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminPage({ admin, setAdmin }) {
  if (!admin) return <LoginPage setAdmin={setAdmin} />;
  return <AdminDashboard />;
}

function LoginPage({ setAdmin }) {
  const [form, setForm] = useState({ username: "prateeksharma4919l", password: "1234" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      setStoredValue("adminToken", data.token);
      setStoredValue("adminUser", JSON.stringify(data.user));
      setAdmin(data.user);
      window.location.hash = "admin";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm dark:border-zinc-800">
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-soft-sweep" />
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100">
            <Shield className="h-3.5 w-3.5" />
            Admin Security Console
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-normal md:text-4xl">Refund Department Login</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
            Review withdrawal cases, approve refund requests, and monitor pending crypto service tickets from a protected dashboard.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-teal-200">24/7</div>
              <div className="mt-1 text-xs text-zinc-300">Queue Ready</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-emerald-200">USDT</div>
              <div className="mt-1 text-xs text-zinc-300">TRC20/ERC20</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-bold text-amber-200">Saved</div>
              <div className="mt-1 text-xs text-zinc-300">Local Records</div>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="animate-panel-in rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-700 text-white dark:bg-teal-500 dark:text-zinc-950">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Admin Sign In</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Use your department username.</p>
          </div>
        </div>
        <Field label="Username">
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input className={`${inputClass} pl-9`} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input type="password" className={`${inputClass} pl-9`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
        </Field>
        {error && <Alert tone="error">{error}</Alert>}
        <button className={`${buttonClass} w-full`}>Login to Dashboard</button>
        <div className="mt-4 rounded-md bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
          Temporary login: <span className="font-semibold text-zinc-700 dark:text-zinc-200">prateeksharma4919l</span> / <span className="font-semibold text-zinc-700 dark:text-zinc-200">1234</span>
        </div>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const [refunds, setRefunds] = useState([]);
  const [analytics, setAnalytics] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [error, setError] = useState("");

  async function load() {
    try {
      const [refundResponse, analyticsResponse] = await Promise.all([api.get("/admin/refunds"), api.get("/admin/analytics")]);
      setRefunds(refundResponse.data.refunds);
      setAnalytics(analyticsResponse.data.analytics);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load admin data");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    await api.patch(`/admin/refunds/${id}`, { status });
    load();
  }

  return (
    <>
      <PageTitle title="Admin Dashboard" subtitle="Review refund submissions, withdrawal amounts, and network details." />
      {error && <Alert tone="error">{error}</Alert>}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Pending" value={analytics.pending} tone="amber" />
        <Metric label="Approved" value={analytics.approved} tone="emerald" />
        <Metric label="Rejected" value={analytics.rejected} tone="rose" />
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <tr>
                  {["Name", "Email", "Amount", "Currency", "Wallet", "TX Hash", "Network", "Department Note", "Status", "Actions"].map((head) => (
                  <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund._id} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="px-4 py-3">{refund.name}</td>
                  <td className="px-4 py-3">{refund.email}</td>
                  <td className="px-4 py-3">{refund.withdrawalAmount || "-"}</td>
                  <td className="px-4 py-3">{refund.currency || "-"}</td>
                  <td className="max-w-52 break-all px-4 py-3">{refund.walletAddress || "-"}</td>
                  <td className="max-w-52 break-all px-4 py-3">{refund.transactionHash}</td>
                  <td className="px-4 py-3">{refund.network}</td>
                  <td className="max-w-64 px-4 py-3">{refund.reason}</td>
                  <td className="px-4 py-3"><StatusBadge status={refund.status} /></td>
                  <td className="space-x-2 px-4 py-3">
                    <button className={ghostButtonClass} onClick={() => updateStatus(refund._id, "approved")}>Approve</button>
                    <button className={ghostButtonClass} onClick={() => updateStatus(refund._id, "rejected")}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {refunds.length === 0 && <EmptyState text="No refund requests yet." />}
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</span>
      {children}
    </label>
  );
}

function Alert({ tone, children }) {
  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200";
  return <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${styles}`}>{children}</div>;
}

function EmptyState({ text }) {
  return <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">{text}</div>;
}

function Metric({ label, value, tone }) {
  const color = {
    amber: "text-amber-700 dark:text-amber-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    rose: "text-rose-700 dark:text-rose-300"
  }[tone];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    "manual-review": "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
    rejected: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
  };

  return <span className={`${badgeClass} ${styles[status] || styles.pending}`}>{status}</span>;
}

function DataTable({ columns, rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-zinc-200 dark:border-zinc-800">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="max-w-72 break-all px-4 py-3">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <EmptyState text="No records found." />}
    </div>
  );
}

export default App;
