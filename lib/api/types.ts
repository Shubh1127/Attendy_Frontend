export type Role = "student" | "teacher";

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** Student-only */
  rollNumber?: string;
  /** Teacher-only */
  department?: string;
}


export interface AuthUser {
  id: number;
  role: Role;
  name: string;
  email?: string;
}


export interface user{
  id:string,
  name:string,
  email:string,
  role:Role,
  avatarUrl?:string,
  rollNumber?:string,
  department?:string
}
export interface SubjectAttendance {
  subject_id: number;
  subject_name: string;
  attendance_percentage: number;
  total_sessions: number;
  attended_sessions: number;
  present: number;
  late: number;
  absent: number;
}

export interface OverallAttendance {
  attendance_percentage: number;
  total_sessions: number;
  attended_sessions: number;
  present: number;
  late: number;
  absent: number;
}

export interface StudentOverallAttendanceResponse {
  success: boolean;
  overall: OverallAttendance;
  subjects: SubjectAttendance[];
  needs_attention: SubjectAttendance[];
}

export interface userContextType{
  user:user | null,
  setUser:React.Dispatch<React.SetStateAction<user | null>>
}
export type BiometricConfidence = number; // 0..1

export interface BiometricLoginResult {
  action: "login" | "register" | "voice_required";

  matched: boolean;

  token?: string;

  expiresAt?: string;

  student_id?: number;

  student_name?: string;

  message?: string;
}

export interface SubjectResponse {
  success: boolean;
  message: string;
  subject: Subject;
}

export interface getSubjectResponse{
  subject_id: number;
  suject_code: string,
  name: string;
  section: string;
  teacher_id: number;
  student_count: number;
  attendance_rate: number;
}

export interface UploadStudentsResponse {

    success: boolean;

    message: string;

  students_added: number;

  students_enrolled: number;

}

export interface Subject {
  subject_id: number;
  subject_code: string;
  name: string;
  section: string;
  teacher_id: number;
  student_count: number;
  attendance_rate: number;

}
export interface getSubject {
  subject_id: number;
  subject_code: string;
  name: string;
  section: string;
  teacher_id: number;

  studentCount: number;
  totalSessions: number;

  present: number;
  absent: number;
  late: number;
  excused: number;

  attendanceRate: number;
}

export interface GetSubjectResponse {
  success: boolean;
  subjects: Subject[];
}
export interface SubjectJoin{
  success: boolean;
  message: string;
  subject: {
    subject_id: number;
    subject_code: string;
    name: string;
    section: string;
    teacher_id: number;
  };
  enrollment: {
    subject_id: number;
    student_id: number;

  }
}
export type SubjectColor = "verdant" | "vermilion" | "amber" | "indigo" | "slate";

export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "pending" | "not_marked";

export interface StudentAttendanceSession {
  session_id: number;
  subject_id: number;
  subject_code: string;
  subject_name: string;
  section: string;

  opened_at: string;
  closed_at: string | null;

  status: "open" | "closed";

  marked: boolean;

  mark_status: "present" | "absent" | "late" | "excused" | "pending";

  marked_at: string | null;
}

export interface GetStudentAttendanceSessionsResponse {
  success: boolean;
  sessions: StudentAttendanceSession[];
}
export interface AttendanceEntry {
  session_id: number;
  subject_id: number;
  student_id: number;

  status: "present" | "absent" | "late" | "pending" | "excused" | "not_marked";

  method: "face" | "voice" | "manual" | null;

  confidence: number | null;

  marked_at: string | null;

  student: {
    id: number;
    name: string;
    enrollment_number: string;
  };
}

export interface GetAttendanceEntriesResponse {
  success: boolean;
  entries: AttendanceEntry[];
}

export interface GetStudentAttendanceEntryResponse {
  success: boolean;
  entry: AttendanceEntry | null;
}


export interface AttendanceSession {
  session_id: number;
  subject_id: number;
  teacher_id: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at?: string | null;
}

export interface ActiveAttendanceSession {
  session_id: number;
  subject_id: number;
  subject_name: string | null;
  subject_code: string | null;
  section: string | null;
  status: "open";
  opened_at: string;
  closed_at: string | null;
  marked: boolean;
  mark_status: AttendanceStatus | null;
  marked_at: string | null;
}

export interface AttendanceSessionSummary {
  session_id: number;
  subject_id: number;
  teacher_id: number;
  status: "closed";
  opened_at: string;
  closed_at: string | null;
  subject_name: string | null;
}

export interface TeacherActiveAttendanceSession {
  session_id: number;
  subject_id: number;
  teacher_id: number;
  status: "open";
  opened_at: string;
  closed_at: string | null;
  subject_name: string | null;
  subject_code: string | null;
  section: string | null;
  checked_in_count: number;
  total_students: number;
}

export interface GetTeacherActiveAttendanceSessionsResponse {
  success: boolean;
  sessions: TeacherActiveAttendanceSession[];
}

export interface AttendanceSession3 {
  session_id: number;
  subject_id: number;
  teacher_id: number;
  status: "open" | "closed";
  opened_at: string;
  closed_at: string | null;
  subjects: {
    subject_id: number;
    subject_code: string;
    name: string;
    section: string;
  };
}

export interface GetAttendanceSessionResponse {
  success: boolean;
  session: AttendanceSession3;
  entries: AttendanceEntry[];
}

export interface GetAttendanceSessionsResponse {
  success: boolean;
  sessions: AttendanceSessionSummary[];
}

export interface GetActiveAttendanceResponse {
  success: boolean;
  sessions: ActiveAttendanceSession[];
}

export interface StudentSubjectAttendanceSession {
  session_id: number;
  subject_id: number;
  opened_at: string;
  closed_at: string | null;
  status: "closed";
  subject_code: string;
  subject_name: string;
  section: string;
  marked: boolean;
  mark_status: AttendanceStatus | null;
  marked_at: string | null;
}

export interface GetStudentSubjectAttendanceSessionsResponse {
  success: boolean;
  subject: {
    subject_id: number;
    subject_code: string;
    name: string;
    section: string;
  };
  sessions: StudentSubjectAttendanceSession[];
}

export interface CheckInAttendanceResponse {
  success: boolean;
  message: string;
  entry: AttendanceEntry;
  session: ActiveAttendanceSession;
}

export interface CreateAttendanceSessionResponse {
  success: boolean;
  message: string;
  session: AttendanceSession;
}

export interface AttendanceEntryUpdate {
  studentId: number;
  status: "present" | "absent" | "late" | "excused" | "pending";
}

export interface UpdateAttendanceSessionRequest {
  entries: AttendanceEntryUpdate[];
}


export interface UpdateAttendanceSessionResponse {
  success: boolean;
  message: string;
  session: AttendanceSession;
}


export interface AttendanceSummary {
  subjectId: string;
  subjectName: string;
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number;
}

export interface DashboardStat {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}


export interface TeacherLoginResponse {
  success: boolean;
  token: string;
  expiresAt: string;
  teacher: {
    id: number;
    name: string;
    email: string;
    role: "teacher";
  };
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface UploadTimetableResponse {
  success: boolean;
  message: string;
  filename: string;
}

export interface UploadStudentDataResponse {
  success: boolean;
  message: string;
  students_added: number;
  students_enrolled: number;
}

export interface AttendanceSummary {

    subject_id: number;

    subject_name: string;

    subject_code: string;

    total: number;

    present: number;

    late: number;

    absent: number;

    percentage: number;

}

export interface AttendanceSummaryResponse {

    success: boolean;

    attendance: AttendanceSummary[];

}