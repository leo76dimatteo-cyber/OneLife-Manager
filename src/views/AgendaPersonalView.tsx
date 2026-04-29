import React, { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type PersonalEvent } from "../db/db";
import { generateIcs } from "../lib/calendar";
import { cn } from "../lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "../components/ui";
import { MapPin, Calendar, Plus, Trash2, Edit2, MapPin as MapIcon, Download, Search } from "lucide-react";

export function AgendaPersonalView() {
  const events = useLiveQuery(() => db.personalEvents.orderBy("date").toArray()) || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PersonalEvent>>({
    title: "",
    date: new Date(),
    location: "",
    notes: "",
    reminders: [60],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) return;

    if (editingId) {
      await db.personalEvents.put({
        ...formData,
        id: editingId,
        date: typeof formData.date === "string" ? new Date(formData.date) : formData.date,
      } as PersonalEvent);
    } else {
      await db.personalEvents.add({
        id: uuidv4(),
        title: formData.title,
        date: typeof formData.date === "string" ? new Date(formData.date) : formData.date,
        location: formData.location,
        notes: formData.notes || "",
        reminders: formData.reminders || [60],
      });
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", date: new Date(), location: "", notes: "", reminders: [60] });
  };

  const handleEdit = (m: PersonalEvent) => {
    setFormData({ ...m });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo evento?")) {
      await db.personalEvents.delete(id);
    }
  };

  const openNavigation = (location: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`, "_blank");
  };

  const exportCalendar = () => {
    const icsContent = generateIcs(events);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "impegni-personali.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-start sm:items-center mb-8 gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Agenda Personale</h2>
          <p className="text-slate-400 text-sm mt-1">I tuoi impegni e allenamenti</p>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {!showForm && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input 
                placeholder="Cerca..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full bg-slate-900 border-slate-800"
              />
            </div>
          )}
          {!showForm && events.length > 0 && (
             <Button variant="outline" size="sm" onClick={exportCalendar} title="Esporta al Calendario">
               <Download className="w-4 h-4 md:mr-2" />
               <span className="hidden md:inline">Esporta</span>
             </Button>
          )}
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">Nuovo</span>
            </Button>
          )}
        </div>
      </div>

      {showForm ? (
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-black italic">{editingId ? "Modifica Evento" : "Nuovo Evento"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo Evento</Label>
                <Input id="title" placeholder="es. Allenamento Palestra" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data e Ora</Label>
                <Input id="date" type="datetime-local" value={formData.date ? format(typeof formData.date === 'string' ? new Date(formData.date) : formData.date, "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => setFormData({...formData, date: new Date(e.target.value)})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Luogo / Indirizzo</Label>
                <Input id="location" placeholder="es. Centro Sportivo, Via Roma 1" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Note Aggiuntive</Label>
                <Textarea id="notes" placeholder="Dettagli..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Annulla</Button>
                <Button type="submit">Salva</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {!showForm && (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6", events.length === 0 ? "h-auto" : "")}>
          {events.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.location?.toLowerCase().includes(searchQuery.toLowerCase()) || m.notes?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-slate-500 border border-dashed rounded-3xl border-slate-700 bg-slate-900/50">
              <Calendar className="w-16 h-16 mx-auto mb-6 opacity-40 text-emerald-500" />
              <p className="text-lg font-medium text-slate-400 mb-4">Nessun evento personale trovato.</p>
              <Button onClick={() => {setShowForm(true); setSearchQuery('');}}>Aggiungi il tuo primo evento</Button>
            </div>
          ) : (
            events.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.location?.toLowerCase().includes(searchQuery.toLowerCase()) || m.notes?.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
              <Card key={m.id} className="p-5 hover:border-emerald-600/50 transition-colors flex flex-col relative group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-2xl font-bold tracking-tighter tabular-nums text-slate-200">{format(m.date, "dd MMM")}</div>
                    <div className="text-sm text-slate-400 font-medium">{format(m.date, "HH:mm")}</div>
                  </div>
                  <div className="flex bg-slate-800/80 md:bg-slate-800 backdrop-blur-sm rounded-full p-1 opacity-100 gap-1 border border-slate-700/50">
                    <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors" onClick={() => handleEdit(m)}><Edit2 className="w-4 h-4" /></button>
                    <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-slate-700 active:bg-red-500/20 transition-colors" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex-1 min-h-[4rem]">
                  <h3 className="font-bold text-lg leading-tight mb-2 uppercase line-clamp-2 text-slate-100">{m.title}</h3>
                  <p className="text-xs text-slate-400 truncate flex items-center"><MapPin className="w-3 h-3 mr-1 shrink-0" /> {m.location}</p>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                  <Button variant="secondary" size="sm" className="flex-1 py-1 h-8 bg-slate-800 hover:bg-emerald-600 text-xs" onClick={() => openNavigation(m.location)}>Naviga</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
