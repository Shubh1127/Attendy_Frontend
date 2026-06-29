import type {
  AttendanceEntry,
  AttendanceSession,
  AttendanceSummary,
  AuthSession,
  BiometricLoginResult,
  Subject,
} from "./types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockStudent: AuthSession["user"] = {
  id: "stu_2201",
  role: "student",
  name: "Aarav Mehta",
  email: "aarav.mehta@sgtuniversity.ac.in",
  rollNumber: "21CSDS0142",
};

const mockTeacher: AuthSession["user"] = {
  id: "tch_0098",
  role: "teacher",
  name: "Dr. Priya Nair",
  email: "priya.nair@sgtuniversity.ac.in",
  department: "Computer Science (Data Science)",
};

export const mockSubjects: Subject[] = [
  {
    id: "sub_ml",
    name: "Machine Learning",
    code: "CSDS-401",
    term: "Semester 6",
    teacherId: "tch_0098",
    teacherName: "Dr. Priya Nair",
    studentCount: 58,
    schedule: "Mon · Wed · Fri — 9:10 AM",
    attendanceRate: 0.91,
    color: "verdant",
  },
  {
    id: "sub_dl",
    name: "Deep Learning Lab",
    code: "CSDS-433",
    term: "Semester 6",
    teacherId: "tch_0098",
    teacherName: "Dr. Priya Nair",
    studentCount: 42,
    schedule: "Tue · Thu — 2:00 PM",
    attendanceRate: 0.74,
    color: "vermilion",
  },
  {
    id: "sub_os",
    name: "Operating Systems",
    code: "CSDS-318",
    term: "Semester 6",
    teacherId: "tch_0451",
    teacherName: "Prof. Karan Bedi",
    studentCount: 61,
    schedule: "Mon · Thu — 11:20 AM",
    attendanceRate: 0.83,
    color: "amber",
  },
  {
    id: "sub_cc",
    name: "Cloud Computing",
    code: "CSDS-377",
    term: "Semester 6",
    teacherId: "tch_0451",
    teacherName: "Prof. Karan Bedi",
    studentCount: 49,
    schedule: "Wed — 3:30 PM",
    attendanceRate: 0.97,
    color: "indigo",
  },
];

function buildEntries(seed: number): AttendanceEntry[] {
  const names = [
    "Aarav Mehta", "Diya Sharma", "Kabir Singh", "Ishita Verma", "Reyansh Gupta",
    "Ananya Joshi", "Vivaan Kapoor", "Myra Chauhan", "Arjun Malhotra", "Saanvi Rao",
  ];
  return names.map((name, i) => {
    const r = (seed + i * 7) % 10;
    const status: AttendanceEntry["status"] =
      r < 7 ? "present" : r < 8 ? "late" : r < 9 ? "absent" : "excused";
    return {
      id: `att_${seed}_${i}`,
      studentId: `stu_${2200 + i}`,
      studentName: name,
      rollNumber: `21CSDS0${120 + i}`,
      status,
      method: status === "present" || status === "late" ? (i % 2 === 0 ? "face" : "voice") : undefined,
      confidence: status === "present" ? 0.9 + (i % 5) / 100 : status === "late" ? 0.86 : undefined,
      markedAt: status !== "absent" ? `09:0${i % 9}:1${i % 5} AM` : undefined,
    };
  });
}

export const mockSession: AttendanceSession = {
  id: "sess_today",
  subjectId: "sub_ml",
  subjectName: "Machine Learning",
  date: "21 June 2026",
  openedAt: "9:10 AM",
  status: "reviewing",
  entries: buildEntries(3),
};

export const mockSummaries: AttendanceSummary[] = mockSubjects.map((s, i) => ({
  subjectId: s.id,
  subjectName: s.name,
  totalSessions: 38 - i * 3,
  present: Math.round((38 - i * 3) * (s.attendanceRate ?? 0.8) * 0.85),
  absent: Math.round((38 - i * 3) * (1 - (s.attendanceRate ?? 0.8)) * 0.6),
  late: Math.round((38 - i * 3) * 0.08),
  excused: Math.round((38 - i * 3) * 0.04),
  rate: s.attendanceRate ?? 0.8,
}));

export const mocks = {
  async faceLogin(role: "student" | "teacher"): Promise<BiometricLoginResult> {
    await wait(1400);
    const user = role === "student" ? mockStudent : mockTeacher;
    return {
      matched: true,
      confidence: 0.97,
      session: {
        token: "mock-token-face",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        user,
      },
    };
  },
  async voiceLogin(role: "student" | "teacher"): Promise<BiometricLoginResult> {
    await wait(1600);
    const user = role === "student" ? mockStudent : mockTeacher;
    return {
      matched: true,
      confidence: 0.93,
      session: {
        token: "mock-token-voice",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        user,
      },
    };
  },
  async subjects(): Promise<Subject[]> {
    await wait(500);
    return mockSubjects;
  },
  async session(): Promise<AttendanceSession> {
    await wait(500);
    return mockSession;
  },
  async summaries(): Promise<AttendanceSummary[]> {
    await wait(500);
    return mockSummaries;
  },
  async currentUser(role: "student" | "teacher") {
    await wait(250);
    return role === "student" ? mockStudent : mockTeacher;
  },
};
