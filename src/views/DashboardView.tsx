import React, { useState, useEffect } from 'react';
import { db } from '../db/db';
import { startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';
import { it, enUS, es, fr, hi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { CalendarDays, User, Clock, MapPin, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import type { MatchEvent, PersonalEvent } from '../db/db';

type TimelineEvent = {
  id: string;
  type: 'sport' | 'personal';
  date: Date;
  title: string;
  subtitle?: string;
};

export function DashboardView() {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const getLocale = () => {
    switch(i18n.language) {
      case 'en': return enUS;
      case 'es': return es;
      case 'fr': return fr;
      case 'hi': return hi;
      default: return it;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });

      const matches = await db.matches.toArray();
      const personalEvents = await db.personalEvents.toArray();

      const weekEvents: TimelineEvent[] = [];

      matches.forEach(m => {
        if (isWithinInterval(m.date, { start, end })) {
          weekEvents.push({
            id: `sport-${m.id}`,
            type: 'sport',
            date: m.date,
            title: m.title,
            subtitle: m.location
          });
        }
      });

      personalEvents.forEach(p => {
        if (isWithinInterval(p.date, { start, end })) {
          weekEvents.push({
            id: `personal-${p.id}`,
            type: 'personal',
            date: p.date,
            title: p.title,
            subtitle: p.notes
          });
        }
      });

      weekEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
      setEvents(weekEvents);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shadow-lg border border-indigo-500/30">
          <CalendarDays className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white mb-1">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-400 font-medium">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('dashboard.this-week')} ({format(startOfWeek(new Date(), { weekStartsOn: 1 }), "d MMM", { locale: getLocale() })} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), "d MMM", { locale: getLocale() })})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic">
              {t('dashboard.no-events')}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, i) => {
                const isPast = event.date < new Date();
                
                return (
                  <div key={event.id} className={cn(
                    "flex flex-col md:flex-row gap-4 p-4 rounded-2xl border",
                    isPast ? "bg-slate-950/50 border-slate-800 opacity-60" : "bg-slate-800/30 border-indigo-500/20"
                  )}>
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 border border-slate-700">
                      {event.type === 'sport' ? (
                        <CalendarDays className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <User className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline space-x-2">
                        <span className="font-bold text-lg text-white">{event.title}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase tracking-widest">
                          {event.type === 'sport' ? t('dashboard.sportive') : t('dashboard.personal')}
                        </span>
                      </div>
                      {event.subtitle && (
                        <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                          {event.type === 'sport' ? <MapPin className="w-3 h-3" /> : ''}
                          {event.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <div className="text-right">
                        <p className="font-bold uppercase">{format(event.date, "EEEE d", { locale: getLocale() })}</p>
                        <p className="text-sm text-slate-400">{format(event.date, "HH:mm")}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
