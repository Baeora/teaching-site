// Day-of-week labels (0 = Sunday)
export const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Time slots from southhillmusic.com — Mon–Fri vs Saturday differ
export const WEEKDAY_SLOTS = ["3:30 PM", "4:45 PM", "6:00 PM", "7:15 PM", "8:30 PM"];
export const SATURDAY_SLOTS = ["12:00 PM", "1:15 PM", "2:30 PM", "3:45 PM", "5:00 PM"];

export function slotsForDay(dayOfWeek) {
  if (dayOfWeek === 6) return SATURDAY_SLOTS;
  if (dayOfWeek === 0) return [];
  return WEEKDAY_SLOTS;
}

// All occurrences of `dayOfWeek` (0–6) within `year`/`monthIdx` (0–11).
export function occurrencesInMonth(year, monthIdx, dayOfWeek) {
  const result = [];
  const date = new Date(year, monthIdx, 1);
  while (date.getMonth() === monthIdx) {
    if (date.getDay() === dayOfWeek) result.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatShortDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

// Payment methods with editable, friendly default copy.
export const PAYMENT_METHODS = [
  {
    id: "venmo",
    label: "Venmo",
    instructions:
      "Please send payment via Venmo to @SouthHillMusic. Include the invoice number in the note so I can match it to your account.",
  },
  {
    id: "zelle",
    label: "Zelle",
    instructions:
      "Please send payment via Zelle to lessons@southhillmusic.com. Add the invoice number in the memo and you're all set.",
  },
  {
    id: "check",
    label: "Check",
    instructions:
      "Please make checks payable to “South Hill Music Lessons.” You can hand it to me at our next lesson — no need to mail anything.",
  },
  {
    id: "cash",
    label: "Cash",
    instructions:
      "Cash is welcome! Just bring it along to the first lesson of the month and we'll be squared away.",
  },
  {
    id: "paypal",
    label: "PayPal",
    instructions:
      "Please send payment via PayPal to lessons@southhillmusic.com. Choose “Friends & Family” if possible, and include the invoice number.",
  },
];

// Stable invoice number: SHML-YYYYMM-### (### increments per-month, stored in localStorage)
const COUNTER_KEY = "shml_invoice_counters";

export function nextInvoiceNumber(year, monthIdx) {
  const ym = `${year}${String(monthIdx + 1).padStart(2, "0")}`;
  let counters = {};
  try {
    counters = JSON.parse(localStorage.getItem(COUNTER_KEY) || "{}");
  } catch {
    counters = {};
  }
  const next = (counters[ym] || 0) + 1;
  return { number: `SHML-${ym}-${String(next).padStart(3, "0")}`, ym, next };
}

export function commitInvoiceNumber(ym, next) {
  let counters = {};
  try {
    counters = JSON.parse(localStorage.getItem(COUNTER_KEY) || "{}");
  } catch {
    counters = {};
  }
  counters[ym] = next;
  localStorage.setItem(COUNTER_KEY, JSON.stringify(counters));
}

// ----- Saved students -----
const STUDENTS_KEY = "shml_saved_students";

export function loadStudents() {
  try {
    return JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveStudent(student) {
  const list = loadStudents();
  const idx = list.findIndex((s) => s.id === student.id);
  if (idx >= 0) list[idx] = student;
  else list.push(student);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
  return list;
}

export function deleteStudent(id) {
  const list = loadStudents().filter((s) => s.id !== id);
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(list));
  return list;
}

export function newStudentId() {
  return "stu_" + Math.random().toString(36).slice(2, 10);
}
