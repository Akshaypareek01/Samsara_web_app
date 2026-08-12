"use client";

import Image from "next/image";
import { Clock, DollarSign, Users } from "lucide-react";
import LetterAvatar from "@/components/LetterAvatar";
import { formatDisplayDate } from "@/lib/formatDisplayDate";

export type ListingEvent = {
  _id: string;
  eventName: string;
  availableseats: string;
  image: string;
  startDate: string;
  startTime: string;
  type: string;
  level?: string;
  teacher?: {
    _id?: string;
    id?: string;
    name: string;
    profileImage?: string;
  };
  status?: boolean;
};

type EventListingCardProps = {
  event: ListingEvent;
  onBook: (eventId: string) => void;
  /** When true, hide Book (current user hosts this event). */
  isOwn?: boolean;
};

/**
 * Compact event card for Events listing grids.
 */
export default function EventListingCard({
  event,
  onBook,
  isOwn = false,
}: EventListingCardProps) {
  return (
    <article className="rounded-xl border border-orange-100/80 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-[140px] w-full bg-[#fff4ef]">
        <Image
          src={event.image || "/images/class1.svg"}
          alt={event.eventName}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        {event.status ? (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Live
          </span>
        ) : null}
      </div>
      <div className="p-3.5 space-y-2">
        <h4
          className="text-sm font-semibold text-gray-900 line-clamp-2"
          title={event.eventName}
        >
          {event.eventName}
        </h4>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <LetterAvatar
            name={event.teacher?.name || "Host"}
            src={event.teacher?.profileImage}
            size={22}
          />
          <span className="truncate">with {event.teacher?.name || "Host"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} aria-hidden />
            {formatDisplayDate(event.startDate)}
            {event.startTime ? ` ${event.startTime}` : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <DollarSign size={13} aria-hidden />
            {event.type === "free" ? "Free" : "Paid"}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Users size={13} aria-hidden />
            {event.availableseats} spots
          </span>
          {isOwn ? (
            <span className="text-xs font-medium text-[#ed662e] px-2 py-1.5">
              You&apos;re the host
            </span>
          ) : (
            <button
              type="button"
              aria-label={`Book ${event.eventName}`}
              className="bg-[#ed662e] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-[#c95520] transition-colors min-h-[32px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40"
              onClick={() => onBook(event._id)}
            >
              Book
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
