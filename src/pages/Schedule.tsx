import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { AppLayout } from "@/components/AppLayout";
import { Calendar, Clock, CheckCircle, XCircle, Plus } from "lucide-react";

const SESSION_TYPES = [
  "Technical Support",
  "Bug Review",
  "Architecture Discussion",
  "Onboarding Session",
  "Code Review",
  "Incident Debrief",
];

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Schedule() {
  const bookings = useQuery(api.bookings.myBookings);
  const createBooking = useMutation(api.bookings.create);
  const updateStatus = useMutation(api.bookings.updateStatus);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Technical Support");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}`).getTime();
      await createBooking({
        title: title.trim(),
        description: description.trim(),
        scheduledAt,
        duration,
        type,
      });
      setShowForm(false);
      setTitle("");
      setDescription("");
      setDate("");
      setTime("09:00");
    } catch (error) {
      console.error("Failed to create booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await updateStatus({ bookingId: bookingId as any, status: "cancelled" });
    } catch (error) {
      console.error("Failed to cancel:", error);
    }
  };

  const upcoming = bookings?.filter(
    (b) => b.scheduledAt >= Date.now() && b.status !== "cancelled",
  );
  const past = bookings?.filter(
    (b) => b.scheduledAt < Date.now() || b.status === "cancelled",
  );

  return (
    <AppLayout>
      <div className="px-8 py-8 max-w-4xl">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="alpine-label text-primary">Schedule</span>
            <h1 className="alpine-heading text-2xl mt-2">
              Book a Session
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Schedule time with the support team for dedicated assistance.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            {showForm ? "Cancel" : "New Booking"}
          </button>
        </div>

        {/* Booking Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="border border-border p-6 mb-8"
          >
            <div className="alpine-label text-primary mb-4">
              New Booking
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="alpine-label block mb-1.5">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Session title"
                    className="w-full border border-border bg-input px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="alpine-label block mb-1.5">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-border bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="alpine-label block mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you need help with?"
                  rows={3}
                  className="w-full border border-border bg-input px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="alpine-label block mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-border bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="alpine-label block mb-1.5">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-border bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="alpine-label block mb-1.5">
                    Duration (min)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full border border-border bg-input px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !date}
                  className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Booking..." : "Book Session"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Upcoming Bookings */}
        <div className="mb-8">
          <div className="alpine-label mb-3">Upcoming</div>
          {upcoming === undefined ? (
            <div className="border border-border py-10 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : upcoming.length === 0 ? (
            <div className="border border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No upcoming sessions.
              </p>
            </div>
          ) : (
            <div className="border border-border">
              {upcoming.map((b, i) => (
                <div
                  key={b._id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    i < upcoming.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-9 items-center justify-center border border-border text-muted-foreground">
                      <Calendar className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{b.title}</div>
                      <div className="mt-0.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{b.type}</span>
                        <span>{formatDateTime(b.scheduledAt)}</span>
                        <span>{b.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        b.status === "confirmed"
                          ? "text-[var(--alpine-green)]"
                          : "text-[var(--alpine-cyan)]"
                      }`}
                    >
                      {b.status}
                    </span>
                    <button
                      onClick={() => handleCancel(b._id)}
                      className="text-muted-foreground hover:text-[var(--alpine-red)] transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past / Cancelled */}
        {past && past.length > 0 && (
          <div>
            <div className="alpine-label mb-3">Past & Cancelled</div>
            <div className="border border-border">
              {past.map((b, i) => (
                <div
                  key={b._id}
                  className={`flex items-center justify-between px-5 py-3.5 opacity-60 ${
                    i < past.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div>
                    <div className="text-sm">{b.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatDateTime(b.scheduledAt)} / {b.duration} min
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
