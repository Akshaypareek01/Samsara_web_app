/**
 * Zoom join helpers — mirrors Samsara_app_prod/utils/zoomJoinUrl.js
 *
 * - user (student): Zoom Web Client /wc/join/ — never ZAK, never Meeting SDK host
 * - teacher: Meeting SDK join-meeting with role=1 + forceHost (ZAK / classic /s/)
 */

export type ZoomJoinPayload = {
  classId?: string;
  eventId?: string;
  sessionId?: string;
  number?: string | number;
  meetingNumber?: string | number;
  pass?: string;
  password?: string;
  account?: string;
  accountId?: string;
  userName?: string;
  email?: string;
  role?: number;
  /** Bearer token forwarded to the join page so it can request a host signature */
  authToken?: string | null;
  /** Samsara account role */
  appRole?: "user" | "teacher" | string;
  userRole?: string;
  asHost?: boolean;
  joinUrl?: string;
  zoomJoinUrl?: string;
};

/**
 * True when a URL is a Zoom host/start link (must never be used for students).
 * @param url - Candidate Zoom URL
 */
export function isZoomHostStartUrl(url: string): boolean {
  const u = String(url).toLowerCase();
  return (
    u.includes("/s/") ||
    u.includes("zak=") ||
    u.includes("start_url") ||
    u.includes("role=1")
  );
}

/**
 * Builds Zoom Web Client participant URL (same as mobile app).
 * Converts …/j/{id}?pwd=… → …/wc/join/{id}?pwd=…
 * @param opts - joinUrl and/or meetingNumber + password
 */
export function buildZoomWebClientJoinUrl(opts: {
  joinUrl?: string;
  meetingNumber?: string | number;
  password?: string;
} = {}): string {
  const { joinUrl, meetingNumber, password } = opts;

  if (joinUrl && typeof joinUrl === "string" && !isZoomHostStartUrl(joinUrl)) {
    const match = joinUrl.match(
      /^(https?:\/\/[^/]+)\/j\/(\d+)(\?[\s\S]*)?$/i
    );
    if (match) {
      return `${match[1]}/wc/join/${match[2]}${match[3] || ""}`;
    }
    if (/\/wc\/join\//i.test(joinUrl)) {
      return joinUrl;
    }
  }

  const id = meetingNumber != null ? String(meetingNumber).trim() : "";
  if (!id) {
    throw new Error("Missing Zoom meeting number");
  }
  const pwd = password ? `?pwd=${encodeURIComponent(password)}` : "";
  return `https://zoom.us/wc/join/${id}${pwd}`;
}

/**
 * @deprecated Use buildZoomWebClientJoinUrl — kept for call sites
 */
export function buildClassicAttendeeJoinUrl(
  payload: ZoomJoinPayload
): string | null {
  try {
    return buildZoomWebClientJoinUrl({
      joinUrl: payload.joinUrl || payload.zoomJoinUrl,
      meetingNumber: payload.meetingNumber ?? payload.number,
      password: payload.password ?? payload.pass,
    });
  } catch {
    return null;
  }
}

/**
 * True when this Samsara actor should join Zoom as host (Meeting SDK + ZAK).
 * Hard rule: role `user` is never host (matches intended mobile behavior).
 * @param flags - Payload flags from navigation
 * @param profileRole - Live /users/profile role
 */
export function shouldJoinAsZoomHost(
  flags: ZoomJoinPayload = {},
  profileRole?: string | null
): boolean {
  const userRole = String(
    flags.userRole || flags.appRole || profileRole || ""
  ).toLowerCase();

  // Students never host — ignore payload.role=1
  if (userRole === "user") return false;

  if (flags.asHost === true || Number(flags.role) === 1) return true;

  return (
    userRole === "teacher" ||
    userRole === "trainer" ||
    userRole === "admin" ||
    userRole === "company"
  );
}

/**
 * Host (teacher): Meeting SDK page with ZAK (forceHost).
 * @param baseUrl - API base including /v1
 * @param payload - Meeting fields
 * @param leaveUrl - Optional leave URL
 */
export function buildZoomJoinMeetingUrl(
  baseUrl: string,
  payload: ZoomJoinPayload,
  leaveUrl?: string
): string {
  const meetingNumber = payload.meetingNumber ?? payload.number;
  const password = payload.password ?? payload.pass ?? "";
  const accountId = payload.accountId ?? payload.account;

  const params = new URLSearchParams();
  if (payload.classId) params.set("classId", String(payload.classId));
  if (payload.eventId) params.set("eventId", String(payload.eventId));
  if (payload.sessionId) params.set("sessionId", String(payload.sessionId));
  if (meetingNumber) params.set("meetingNumber", String(meetingNumber));
  if (password) params.set("password", String(password));
  if (accountId) params.set("accountId", String(accountId));
  params.set("userName", payload.userName || "Host");
  params.set("role", "1");
  params.set("appRole", "teacher");
  params.set("forceHost", "1");
  // /zoom/generateSDKSignature authenticates the caller before minting a host
  // signature + ZAK, so the join page needs a token to forward.
  if (payload.authToken) params.set("authToken", String(payload.authToken));

  if (leaveUrl) {
    params.set("leaveUrl", leaveUrl);
  } else if (typeof window !== "undefined") {
    params.set(
      "leaveUrl",
      `${window.location.origin}/Homepage/Classes/Scheduled`
    );
  }

  return `${baseUrl.replace(/\/$/, "")}/zoom/join-meeting?${params.toString()}`;
}

type MeetingDetailsData = {
  meetingNumber?: string;
  password?: string;
  joinUrl?: string;
  accountId?: string;
  hostMode?: string;
  useMeetingSdk?: boolean;
  sdkJoinPath?: string;
};

/**
 * Same as mobile fetchZoomWebClientJoinUrl:
 * - Host → Meeting SDK + ZAK (or WC if Basic + forced)
 * - Attendee → Zoom Web Client /wc/join (no ZAK)
 *
 * @param baseUrl - API base including /v1
 * @param payload - class/event/session ids + names
 * @param asHost - Teacher host join
 * @param accessToken - Bearer token for getMeetingDetails
 */
export async function resolveZoomJoinUrl(
  baseUrl: string,
  payload: ZoomJoinPayload,
  asHost: boolean,
  accessToken?: string | null
): Promise<string> {
  const ids: { classId?: string; eventId?: string; sessionId?: string } = {};
  if (payload.classId) ids.classId = String(payload.classId);
  if (payload.eventId) ids.eventId = String(payload.eventId);
  if (payload.sessionId) ids.sessionId = String(payload.sessionId);

  const params = new URLSearchParams();
  if (ids.classId) params.set("classId", ids.classId);
  if (ids.eventId) params.set("eventId", ids.eventId);
  if (ids.sessionId) params.set("sessionId", ids.sessionId);
  if (asHost) params.set("asHost", "1");

  let data: MeetingDetailsData = {};

  if (ids.classId || ids.eventId || ids.sessionId) {
    const headers: HeadersInit = { Accept: "application/json" };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/zoom/getMeetingDetails?${params.toString()}`,
      { headers }
    );
    const json = await response.json().catch(() => ({}));
    if (!response.ok || json.status !== "success") {
      throw new Error(
        json.message || `Failed to load meeting details (${response.status})`
      );
    }
    data = json.data || {};
  } else {
    data = {
      meetingNumber: String(payload.meetingNumber ?? payload.number ?? ""),
      password: String(payload.password ?? payload.pass ?? ""),
      joinUrl: payload.joinUrl || payload.zoomJoinUrl,
      accountId: payload.accountId || payload.account,
    };
  }

  if (asHost) {
    // Mirror mobile: Basic Zoom may force WC; consumer web teachers still use SDK+ZAK via forceHost
    if (data.hostMode === "web_participant" || data.useMeetingSdk === false) {
      return buildZoomWebClientJoinUrl({
        joinUrl: data.joinUrl,
        meetingNumber: data.meetingNumber,
        password: data.password,
      });
    }

    if (data.sdkJoinPath && typeof data.sdkJoinPath === "string") {
      const path = data.sdkJoinPath.startsWith("http")
        ? data.sdkJoinPath
        : `${baseUrl.replace(/\/v1\/?$/, "")}${data.sdkJoinPath}`;
      if (!accessToken) return path;
      return `${path}${path.includes("?") ? "&" : "?"}authToken=${encodeURIComponent(accessToken)}`;
    }

    return buildZoomJoinMeetingUrl(baseUrl, {
      ...payload,
      meetingNumber: data.meetingNumber ?? payload.meetingNumber ?? payload.number,
      password: data.password ?? payload.password ?? payload.pass,
      accountId: data.accountId ?? payload.accountId ?? payload.account,
      role: 1,
      appRole: "teacher",
      authToken: accessToken,
    });
  }

  // Attendee — WC join only (no ZAK, no Meeting SDK host path)
  return buildZoomWebClientJoinUrl({
    joinUrl: data.joinUrl || payload.joinUrl || payload.zoomJoinUrl,
    meetingNumber:
      data.meetingNumber ?? payload.meetingNumber ?? payload.number,
    password: data.password ?? payload.password ?? payload.pass,
  });
}
