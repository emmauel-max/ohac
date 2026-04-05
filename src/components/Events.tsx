import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { linkify } from "../utils/linkify";
import type { Event } from "../types";
import "./Events.css";

const SAMPLE_EVENTS: Event[] = [
  {
    id: "e1",
    title: "Annual Passing Out Parade",
    description: "The annual graduation parade for outgoing cadets of Oguaa Hall Army Cadet Corps. All cadets must attend in full dress uniform.",
    date: "2026-04-15",
    location: "UCC Main Parade Ground",
    organizer: "OHAC Command",
    createdAt: Date.now(),
  },
  {
    id: "e2",
    title: "Military Skills Competition",
    description: "Inter-hall military skills competition including drill, map reading, first aid, and obstacle course events.",
    date: "2026-05-10",
    location: "Oguaa Hall Grounds",
    organizer: "OHAC Training Officer",
    createdAt: Date.now(),
  },
  {
    id: "e3",
    title: "Physical Fitness Assessment",
    description: "Bi-annual OHAC Physical Fitness Test. All cadets must register and report in PT uniform by 0600hrs.",
    date: "2026-03-28",
    location: "UCC Sports Complex",
    organizer: "OHAC PT Instructor",
    createdAt: Date.now(),
  },
  {
    id: "e4",
    title: "Cadet Orientation Day",
    description: "Orientation for newly enlisted cadets. Introduction to OHAC history, values, and expectations.",
    date: "2026-04-02",
    location: "Oguaa Hall Common Room",
    organizer: "OHAC Commandant",
    createdAt: Date.now(),
  },
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const q = query(collection(db, "events"), orderBy("date"));
        const snap = await getDocs(q);
        if (snap.docs.length > 0) {
          setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Event)));
        } else {
          setEvents(SAMPLE_EVENTS);
        }
      } catch {
        setEvents(SAMPLE_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events.filter((e) => new Date(e.date) < new Date(new Date().toDateString()));

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null;
    const [hourRaw, minuteRaw] = timeStr.split(":");
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return timeStr;

    const dt = new Date();
    dt.setHours(hour, minute, 0, 0);
    return dt.toLocaleTimeString("en-GH", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date(new Date().toDateString());
    const event = new Date(dateStr);
    const diff = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };


  return (
    <div className="events-page">
      <div className="page-header">
        <h1>📅 Events & Training Schedule</h1>
        <p>Upcoming parades, exercises, and cadet activities</p>
      </div>

      {loading ? (
        <div className="loading">Loading events...</div>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <section className="events-section">
              <h2>Upcoming Events</h2>
              <div className="events-grid">
                {upcomingEvents.map((event) => {
                  return (
                    <div key={event.id} className="event-card upcoming">
                      <div className="event-countdown">{getDaysUntil(event.date)}</div>
                      <h3>{event.title}</h3>
                      <p className="event-description">{linkify(event.description)}</p>
                      <div className="event-details">
                        <div className="event-detail">
                          <span>📅</span>
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="event-detail">
                            <span>⏰</span>
                            <span>{formatTime(event.time)}</span>
                          </div>
                        )}
                        <div className="event-detail">
                          <span>📍</span>
                          <span>{event.location}</span>
                        </div>
                        <div className="event-detail">
                          <span>👤</span>
                          <span>{event.organizer}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {pastEvents.length > 0 && (
            <section className="events-section">
              <h2>Past Events</h2>
              <div className="events-grid past">
                {pastEvents.map((event) => (
                  <div key={event.id} className="event-card past">
                    <div className="event-countdown past-label">Completed</div>
                    <h3>{event.title}</h3>
                    <div className="event-details">
                      <div className="event-detail">
                        <span>📅</span>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.time && (
                        <div className="event-detail">
                          <span>⏰</span>
                          <span>{formatTime(event.time)}</span>
                        </div>
                      )}
                      <div className="event-detail">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
