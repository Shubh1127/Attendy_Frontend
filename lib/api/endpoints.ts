import { apiClient, type ApiResult } from "./client";
import { env } from "./env";

import type {
  AttendanceSession,
  AttendanceSummary,
  TeacherLoginResponse,
  BiometricLoginResult,
  Role,
  Subject,
  AuthUser,
  SubjectResponse,
  SubjectJoin,
  getSubject,
  getSubjectResponse,
  GetSubjectResponse,
  CreateAttendanceSessionResponse,
  GetAttendanceSessionsResponse,
  GetTeacherActiveAttendanceSessionsResponse,
  GetAttendanceSessionResponse,
  GetActiveAttendanceResponse,
  AttendanceEntryUpdate,
  UpdateAttendanceSessionResponse,
  GetAttendanceEntriesResponse,
  AttendanceSummaryResponse,
  CheckInAttendanceResponse,
  GetStudentSubjectAttendanceSessionsResponse,
  UploadStudentsResponse,
  UploadStudentDataResponse,
  UploadTimetableResponse,
  GetStudentAttendanceSessionsResponse,
  StudentOverallAttendanceResponse,
} from "./types";

/**
 * Every network call the frontend makes lives in this file. Swap mock
 * implementations for real ones by setting NEXT_PUBLIC_USE_MOCKS=false and
 * NEXT_PUBLIC_API_BASE_URL to the Python backend — no component changes
 * required, since every screen depends on this module's return types only.
 */

function asResult<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export const endpoints = {
  async teacherLogin(
    email: string,
    password: string,
  ): Promise<ApiResult<TeacherLoginResponse>> {
    return apiClient.post<TeacherLoginResponse>("/teacher/login", {
      email,
      password,
    });
  },
  async teacherRegister(
    name: string,
    password: string,
    email: string,
  ): Promise<ApiResult<TeacherLoginResponse>> {
    return apiClient.post<TeacherLoginResponse>("/teacher/register", {
      name,
      password,
      email,
    });
  },

  async verifyStudent(
    enrollmentNumber: string,
    image: Blob,
    audio?: Blob,
  ): Promise<ApiResult<BiometricLoginResult>> {
    const form = new FormData();

    form.append("enrollmentNumber", enrollmentNumber);

    form.append("faceImage", image, "face.jpg");
    if (audio) {
      form.append("voiceAudio", audio, "voice.webm");
    }

    return apiClient.postForm<BiometricLoginResult>("/student/verify", form, {
      timeoutMs: 30000,
    });
  },

  async getMe(token: string): Promise<ApiResult<AuthUser>> {
    return apiClient.get<AuthUser>("/me", { token });
  },

  // Subjects endpoints
  async createSubject(
    token: string,
    payload: { subject_code: string; name: string; section: string },
  ): Promise<ApiResult<SubjectResponse>> {
    return apiClient.post<SubjectResponse>("/subjects/create", payload, {
      token,
    });
  },

  async joinSubject(
    token: string,
    payload: { code: string },
  ): Promise<ApiResult<SubjectJoin>> {
    return apiClient.post<SubjectJoin>("/subjects/join", payload, { token });
  },
  async getSubject(
    token: string,
    subject_id: number,
  ): Promise<ApiResult<getSubject>> {
    return apiClient.get<getSubject>(`/subjects/${subject_id}`, {
      token,
    });
  },

  async getSubjects(token: string): Promise<ApiResult<GetSubjectResponse>> {
    return apiClient.get<GetSubjectResponse>("/subjects", { token });
  },

  async createAttendanceSession(
    token: string,
    subjectId: number,
  ): Promise<ApiResult<CreateAttendanceSessionResponse>> {
    return apiClient.post<CreateAttendanceSessionResponse>(
      "/attendance/sessions",
      { subjectId },
      { token },
    );
  },

  async getStudentAttendanceSessions(
  token: string
): Promise<ApiResult<GetStudentAttendanceSessionsResponse>> {
  return apiClient.get<GetStudentAttendanceSessionsResponse>(
    "/student/attendance-sessions",
    { token }
  );
},
  async getAttendanceSessions(
    token: string,
    subjectId?: number,
  ): Promise<ApiResult<GetAttendanceSessionsResponse>> {
    const url = subjectId
      ? `/attendance/sessions?subjectId=${subjectId}`
      : "/attendance/sessions";

    return apiClient.get<GetAttendanceSessionsResponse>(url, {
      token,
    });
  },

  async getTeacherActiveAttendanceSessions(
    token: string,
  ): Promise<ApiResult<GetTeacherActiveAttendanceSessionsResponse>> {
    return apiClient.get<GetTeacherActiveAttendanceSessionsResponse>(
      "/attendance/sessions/active",
      { token },
    );
  },

  async getAttendanceSession(
    sessionId: number,
    token: string,
  ): Promise<ApiResult<GetAttendanceSessionResponse>> {
    return apiClient.get<GetAttendanceSessionResponse>(
      `/attendance/sessions/${sessionId}`,
      {
        token,
      },
    );
  },
  async updateAttendanceSession(
    sessionId: number,
    entries: AttendanceEntryUpdate[],
    token: string,
  ): Promise<ApiResult<UpdateAttendanceSessionResponse>> {
    return apiClient.patch<UpdateAttendanceSessionResponse>(
      `/attendance/sessions/${sessionId}`,
      {
        entries,
      },
      {
        token,
      },
    );
  },

  async getAttendanceEntries(
    sessionId: number,
    token: string,
  ): Promise<ApiResult<GetAttendanceEntriesResponse>> {
    return apiClient.get<GetAttendanceEntriesResponse>(
      `/attendance/sessions/${sessionId}/entries`,
      {
        token,
      },
    );
  },

  async getAttendanceSummary(
    token: string,
  ): Promise<ApiResult<AttendanceSummaryResponse>> {
    return apiClient.get<AttendanceSummaryResponse>("/student/attendance", {
      token,
    });
  },

  async getStudentOverallAttendance(
    token: string,
  ): Promise<ApiResult<StudentOverallAttendanceResponse>> {
    return apiClient.get<StudentOverallAttendanceResponse>("/student/overall-attendance", {
      token,
    });
  },
  async getActiveAttendance(
    token: string,
  ): Promise<ApiResult<GetActiveAttendanceResponse>> {
    return apiClient.get<GetActiveAttendanceResponse>("/student/attendance/active", {
      token,
    });
  },

  async getStudentSubjectAttendanceSessions(
    token: string,
    subjectId: number,
  ): Promise<ApiResult<GetStudentSubjectAttendanceSessionsResponse>> {
    return apiClient.get<GetStudentSubjectAttendanceSessionsResponse>(
      `/student/subjects/${subjectId}/attendance-sessions`,
      { token },
    );
  },

  async checkInAttendance(
    token: string,
    sessionId: number,
    faceImage: Blob,
  ): Promise<ApiResult<CheckInAttendanceResponse>> {
    const form = new FormData();
    form.append("faceImage", faceImage, "face.jpg");

    return apiClient.postForm<CheckInAttendanceResponse>(
      `/student/attendance/${sessionId}/check-in`,
      form,
      { token },
    );
  },


  async uploadStudents(
    token: string
    ,subjectId: number,
    pdf: File,
): Promise<ApiResult<UploadStudentsResponse>> {

    const form = new FormData();

    form.append(
        "file",
        pdf
    );

    return apiClient.postForm(
      `/subjects/${subjectId}/students/upload`,
        form,
        {
            token
        }
    );

},
async uploadTimetable(
  formData: FormData,
  token: string,
): Promise<ApiResult<UploadTimetableResponse>> {
  return apiClient.post<UploadTimetableResponse>(
    "/subjects/upload-timetable",
    formData,
    { token }
  );
},

async uploadStudentData(
  token: string,
  subject_id: number,
  formData: FormData,
): Promise<ApiResult<UploadStudentDataResponse>> {
  return apiClient.postForm<UploadStudentDataResponse>(
    `/subjects/${subject_id}/students/upload`,
    formData,
    { token }
  );
},
};
