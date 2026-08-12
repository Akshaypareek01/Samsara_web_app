export interface TeacherQualification {
  title: string;
  subtitle: string;
  year: string;
}

export interface TeacherImage {
  _id: string;
  filename: string;
  path: string;
  key: string;
}

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  teacherCategory: string;
  expertise: string[];
  teachingExperience: string;
  qualification: TeacherQualification[];
  additional_courses: string[];
  achievements: string[];
  images: TeacherImage[];
  image: TeacherImage;
  profileImage?: string;
}

export interface Student {
  _id: string;
  email: string;
  name: string;
}

export interface EventDetails {
  _id: string;
  eventName: string;
  details: string;
  availableseats: string;
  eventmode: string;
  image: string;
  level: string;
  location: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  type: string;
  teacher: Teacher;
  students: Student[];
  status: boolean;
  description?: string;
  meeting_number?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  AboutMe?: string;
  notificationToken?: string;
  favoriteClasses?: string[];
  favoriteEvents?: string[];
  favoriteTeachers?: string[];
  teacherCategory?: string;
  attendance?: string[];
  classFeedback?: string[];
  images?: string[];
}

/**
 * Resolves host avatar URL from teacher profile fields (no Unsplash).
 * @param teacher - Event teacher payload
 */
export function getHostImageUrl(teacher?: Teacher | null): string {
  if (!teacher) return "/images/logo.svg";
  if (teacher.profileImage?.trim()) return teacher.profileImage.trim();
  const fromImage = teacher.image?.path?.trim();
  if (fromImage) return fromImage;
  const fromGallery = teacher.images
    ?.find((img) => img?.path?.trim())
    ?.path?.trim();
  if (fromGallery) return fromGallery;
  return "/images/logo.svg";
}

/**
 * Formats an event date for display — never returns raw ISO.
 * @param dateString - ISO date string
 */
export function formatEventDate(dateString: string): string {
  if (!dateString) return "Date TBA";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Date TBA";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Computes duration label from start/end time strings.
 * @param startTime - HH:mm start
 * @param endTime - HH:mm end
 */
export function calculateEventDuration(
  startTime?: string,
  endTime?: string
): string {
  if (!startTime || !endTime) return "75 minutes";
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMins = Math.round((end.getTime() - start.getTime()) / 60000);
  return `${diffMins} minutes`;
}
