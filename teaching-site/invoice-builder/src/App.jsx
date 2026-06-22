import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "./InvoicePDF.jsx";
import {
  DAYS,
  MONTHS,
  PAYMENT_METHODS,
  commitInvoiceNumber,
  deleteStudent,
  formatCurrency,
  formatShortDate,
  loadStudents,
  newStudentId,
  nextInvoiceNumber,
  occurrencesInMonth,
  saveStudent,
  slotsForDay,
} from "./utils.js";

const BUSINESS = {
  name: "South Hill Music Lessons",
  tagline: "Private music lessons · Spokane, WA",
  contactName: "Michael Skriloff",
  email: "lessons@southhillmusic.com",
  phone: "(732) 850-2074",
  location: "South Hill · Spokane, WA",
};

const DEFAULT_RATE = 60;

const today = new Date();

export default function App() {
  // Form state
  const [studentId, setStudentId] = useState(null); // null = new
  const [studentName, setStudentName] = useState("");
  const [hasParent, setHasParent] = useState(false);
  const [parentName, setParentName] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [timeSlot, setTimeSlot] = useState("4:45 PM");
  const [year, setYear] = useState(today.getFullYear());
  const [monthIdx, setMonthIdx] = useState(today.getMonth());
  const [rateInput, setRateInput] = useState(""); // empty -> default to 60
  const [paymentId, setPaymentId] = useState(PAYMENT_METHODS[0].id);
  const [paymentText, setPaymentText] = useState(PAYMENT_METHODS[0].instructions);
  const [notes, setNotes] = useState("");

  const [savedStudents, setSavedStudents] = useState(() => loadStudents());
  const [generating, setGenerating] = useState(false);
  const [lastFile, setLastFile] = useState(null);

  // Keep timeSlot valid when day changes
  useEffect(() => {
    const slots = slotsForDay(dayOfWeek);
    if (slots.length === 0) {
      setTimeSlot("");
    } else if (!slots.includes(timeSlot)) {
      setTimeSlot(slots[0]);
    }
  }, [dayOfWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync payment instructions when method changes (preserve manual edits if same id)
  function onPaymentMethodChange(id) {
    setPaymentId(id);
    const next = PAYMENT_METHODS.find((m) => m.id === id);
    if (next) setPaymentText(next.instructions);
  }

  const rate = useMemo(() => {
    const n = parseFloat(rateInput);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_RATE;
  }, [rateInput]);

  const lessons = useMemo(
    () => occurrencesInMonth(year, monthIdx, dayOfWeek),
    [year, monthIdx, dayOfWeek]
  );

  // Stable key for a lesson date (uses local Y-M-D, avoids UTC drift)
  const keyFor = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  // Which lesson dates are included on the invoice. Default: all of them.
  const [selectedKeys, setSelectedKeys] = useState(
    () => new Set(lessons.map(keyFor))
  );

  // When the month/day mix changes, reset selection to "all included"
  useEffect(() => {
    setSelectedKeys(new Set(lessons.map(keyFor)));
  }, [year, monthIdx, dayOfWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedLessons = useMemo(
    () => lessons.filter((d) => selectedKeys.has(keyFor(d))),
    [lessons, selectedKeys]
  );

  const invoiceDate = selectedLessons[0] || null;
  const total = selectedLessons.length * rate;
  const dayLabel = DAYS.find((d) => d.value === dayOfWeek)?.label || "";

  function toggleLesson(key) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  const selectAllLessons = () => setSelectedKeys(new Set(lessons.map(keyFor)));
  const clearAllLessons = () => setSelectedKeys(new Set());
  const isPartial =
    selectedLessons.length > 0 && selectedLessons.length < lessons.length;

  function pickStudent(id) {
    if (!id) {
      // Reset to a new student
      setStudentId(null);
      setStudentName("");
      setHasParent(false);
      setParentName("");
      setRateInput("");
      return;
    }
    const s = savedStudents.find((x) => x.id === id);
    if (!s) return;
    setStudentId(s.id);
    setStudentName(s.studentName || "");
    setHasParent(Boolean(s.parentName));
    setParentName(s.parentName || "");
    setDayOfWeek(s.dayOfWeek ?? 1);
    setTimeSlot(s.timeSlot || "4:45 PM");
    setRateInput(s.rate && s.rate !== DEFAULT_RATE ? String(s.rate) : "");
  }

  function handleSaveStudent() {
    if (!studentName.trim()) return;
    const record = {
      id: studentId || newStudentId(),
      studentName: studentName.trim(),
      parentName: hasParent ? parentName.trim() : "",
      dayOfWeek,
      timeSlot,
      rate,
    };
    const list = saveStudent(record);
    setSavedStudents(list);
    setStudentId(record.id);
  }

  function handleDeleteStudent() {
    if (!studentId) return;
    const list = deleteStudent(studentId);
    setSavedStudents(list);
    setStudentId(null);
  }

  async function handleGeneratePDF() {
    if (!studentName.trim() || !invoiceDate || !timeSlot) return;
    setGenerating(true);
    try {
      const { number, ym, next } = nextInvoiceNumber(year, monthIdx);
      const doc = (
        <InvoicePDF
          invoiceNumber={number}
          invoiceDate={invoiceDate}
          studentName={studentName.trim()}
          parentName={hasParent ? parentName.trim() : ""}
          dayLabel={dayLabel}
          timeSlot={timeSlot}
          monthLabel={`${MONTHS[monthIdx]} ${year}${isPartial ? " (prorated)" : ""}`}
          lessons={selectedLessons}
          rate={rate}
          paymentInstructions={paymentText}
          notes={notes}
          logoSrc={`${window.location.origin}/logo_white.png`}
          business={BUSINESS}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const safeStudent = studentName.trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
      const filename = `Invoice_${safeStudent}_${MONTHS[monthIdx]}_${year}${
        isPartial ? "_prorated" : ""
      }.pdf`;

      // Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Commit the invoice counter only on successful generation
      commitInvoiceNumber(ym, next);

      setLastFile({ url, filename, number });
    } finally {
      setGenerating(false);
    }
  }

  const yearOptions = useMemo(() => {
    const y = today.getFullYear();
    return [y - 1, y, y + 1, y + 2];
  }, []);

  const slots = slotsForDay(dayOfWeek);
  const canGenerate =
    studentName.trim() &&
    invoiceDate &&
    timeSlot &&
    selectedLessons.length > 0 &&
    (!hasParent || parentName.trim());

  return (
    <div className="min-h-screen w-full">
      {/* Top Nav */}
      <header className="nav">
        <div className="container-app mx-auto py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo_white.png" alt="" className="h-8" />
            <div>
              <p className="font-semibold tracking-tight">Invoice Builder</p>
              <p className="text-xs text-slate-400">South Hill Music Lessons</p>
            </div>
          </div>
          <span className="badge badge-secondary hidden sm:inline-flex">Local Tool</span>
        </div>
      </header>

      <main className="container-app mx-auto py-10">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8">
          {/* ----- Form ----- */}
          <section className="card p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Build an invoice</h1>
              <p className="mt-1 text-sm text-slate-300">
                Fill out the fields and click <em>Generate PDF</em>. Students can be saved for
                quick reuse.
              </p>
            </div>

            {/* Saved students */}
            {savedStudents.length > 0 && (
              <div>
                <label className="label">Recall a saved student</label>
                <div className="flex gap-2">
                  <select
                    className="field"
                    value={studentId || ""}
                    onChange={(e) => pickStudent(e.target.value)}
                  >
                    <option value="">— New student —</option>
                    {savedStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.studentName}
                        {s.parentName ? ` (paid by ${s.parentName})` : ""}
                      </option>
                    ))}
                  </select>
                  {studentId && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={handleDeleteStudent}
                      title="Remove this saved student"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Names */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Student name *</label>
                <input
                  className="field"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Abby Johnson"
                />
              </div>
              <div>
                <label className="label inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasParent}
                    onChange={(e) => setHasParent(e.target.checked)}
                  />
                  Bill a parent / guardian
                </label>
                <input
                  className="field"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder={hasParent ? "Parent name" : "(disabled)"}
                  disabled={!hasParent}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Day of the week</label>
                <select
                  className="field"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                >
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Time slot</label>
                {slots.length > 0 ? (
                  <select
                    className="field"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    {slots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="field"
                    value="No regular slots on Sunday"
                    disabled
                  />
                )}
              </div>
            </div>

            {/* Month + Rate */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Month</label>
                <select
                  className="field"
                  value={monthIdx}
                  onChange={(e) => setMonthIdx(Number(e.target.value))}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select
                  className="field"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Rate per lesson</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="field"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  placeholder={`Default $${DEFAULT_RATE}`}
                />
              </div>
            </div>

            {/* Payment */}
            <div>
              <label className="label">Payment method</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PAYMENT_METHODS.map((m) => {
                  const active = paymentId === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => onPaymentMethodChange(m.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition border ${
                        active
                          ? "border-transparent text-slate-900"
                          : "border-white/10 text-slate-200 hover:bg-white/5"
                      }`}
                      style={active ? { background: "var(--brand-primary)" } : undefined}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                rows={3}
                className="field mt-3"
                value={paymentText}
                onChange={(e) => setPaymentText(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                Edit the copy above if you want to tweak it for this invoice.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                rows={3}
                className="field"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything you want to add — e.g. credits, makeup lessons, holidays."
              />
            </div>

            {/* Save + Generate */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleSaveStudent}
                disabled={!studentName.trim()}
              >
                {studentId ? "Update saved student" : "Save student"}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGeneratePDF}
                disabled={!canGenerate || generating}
              >
                {generating ? "Generating…" : "Generate PDF"}
              </button>
            </div>
            {lastFile && (
              <p className="text-sm text-slate-300">
                Last generated:{" "}
                <a
                  className="underline"
                  style={{ color: "var(--brand-primary)" }}
                  href={lastFile.url}
                  download={lastFile.filename}
                >
                  {lastFile.filename}
                </a>{" "}
                ({lastFile.number})
              </p>
            )}
          </section>

          {/* ----- Live summary ----- */}
          <aside className="card p-6 space-y-5 h-fit lg:sticky lg:top-20">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Preview</p>
              <h2 className="text-xl font-semibold mt-1">
                {studentName.trim() || "Student name"}
              </h2>
              {hasParent && parentName.trim() && (
                <p className="text-sm text-slate-300">Billed to {parentName.trim()}</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 space-y-2">
              <Line label="Schedule">
                {dayLabel}s · {timeSlot || "—"}
              </Line>
              <Line label="Period">
                {MONTHS[monthIdx]} {year}
              </Line>
              <Line label="Invoice date">
                {invoiceDate ? formatShortDate(invoiceDate) + ", " + year : "—"}
              </Line>
              <Line label="Lesson count">
                {selectedLessons.length}
                {isPartial && (
                  <span className="text-xs text-slate-400 font-normal">
                    {" "}
                    of {lessons.length}
                  </span>
                )}
              </Line>
              <Line label="Rate">{formatCurrency(rate)}</Line>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Total due</span>
                <span
                  className="text-2xl font-extrabold"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {lessons.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Include which lessons?
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={selectAllLessons}
                      className="text-xs px-2 py-1 rounded-md border border-white/10 text-slate-300 hover:bg-white/5"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllLessons}
                      className="text-xs px-2 py-1 rounded-md border border-white/10 text-slate-300 hover:bg-white/5"
                    >
                      None
                    </button>
                  </div>
                </div>
                <ul className="space-y-1 text-sm">
                  {lessons.map((d) => {
                    const k = keyFor(d);
                    const checked = selectedKeys.has(k);
                    const isFirstSelected =
                      checked && invoiceDate && keyFor(invoiceDate) === k;
                    return (
                      <li key={k}>
                        <label
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition ${
                            checked ? "bg-white/5" : "opacity-60 hover:opacity-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLesson(k)}
                            className="accent-[var(--brand-primary)]"
                          />
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{
                              background: checked
                                ? "var(--brand-primary)"
                                : "rgba(255,255,255,0.2)",
                            }}
                          />
                          <span className="text-slate-200">
                            {d.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {isFirstSelected && (
                            <span className="text-xs text-slate-400">
                              (invoice date)
                            </span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
                {isPartial && (
                  <p className="mt-2 text-xs text-slate-400">
                    Prorated: billing {selectedLessons.length} of {lessons.length}{" "}
                    {dayLabel}s.
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-10">
        <div className="container-app mx-auto py-6 text-xs text-slate-400 text-center">
          Local tool · No data leaves this browser. Saved students live in localStorage.
        </div>
      </footer>
    </div>
  );
}

function Line({ label, children }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-100 font-medium">{children}</span>
    </div>
  );
}
