import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type MatchEvent, type Arena } from "../db/db";
import { generateIcs, parseIcs } from "../lib/calendar";
import { cn } from "../lib/utils";
import { openNavigation } from "../lib/nav";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "../components/ui";
import { MapPin, Share2, Bell, Calendar, Plus, Trash2, Edit2, Upload, Download, MapPin as MapIcon, Phone, Search, Book } from "lucide-react";
import { toast } from "sonner";

export function AgendaSportView() {
  const { t, i18n } = useTranslation();
  const matches = useLiveQuery(() => db.matches.orderBy("date").toArray()) || [];
  const arenas = useLiveQuery(() => db.arenas.orderBy("name").toArray()) || [];
  
  const [activeTab, setActiveTab] = useState<'partite' | 'palazzetti'>('partite');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Game Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MatchEvent>>({
    title: "",
    date: new Date(),
    location: "",
    notes: "",
    reminders: [60],
  });

  // Arena Form State
  const [showArenaForm, setShowArenaForm] = useState(false);
  const [editingArenaId, setEditingArenaId] = useState<string | null>(null);
  const [arenaFormData, setArenaFormData] = useState<Partial<Arena>>({
    name: "",
    address: "",
    contacts: "",
  });

  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) return;

    if (editingId) {
      await db.matches.put({
        ...formData,
        id: editingId,
        date: typeof formData.date === "string" ? new Date(formData.date) : formData.date,
      } as MatchEvent);
    } else {
      await db.matches.add({
        id: uuidv4(),
        title: formData.title,
        date: typeof formData.date === "string" ? new Date(formData.date) : formData.date,
        location: formData.location,
        notes: formData.notes || "",
        reminders: formData.reminders || [60],
        isSynced: false,
      });
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", date: new Date(), location: "", notes: "", reminders: [60] });
  };

  const handleSaveArena = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arenaFormData.name || !arenaFormData.address) return;

    if (editingArenaId) {
      await db.arenas.put({
        ...arenaFormData,
        id: editingArenaId,
      } as Arena);
    } else {
      await db.arenas.add({
        id: uuidv4(),
        name: arenaFormData.name,
        address: arenaFormData.address,
        contacts: arenaFormData.contacts || "",
      });
    }

    setShowArenaForm(false);
    setEditingArenaId(null);
    setArenaFormData({ name: "", address: "", contacts: "" });
  };

  const handleEditMatch = (m: MatchEvent) => {
    setFormData({ ...m });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleEditArena = (a: Arena) => {
    setArenaFormData({ ...a });
    setEditingArenaId(a.id);
    setShowArenaForm(true);
  };

  const handleDeleteMatch = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      await db.matches.delete(id);
    }
  };

  const handleDeleteArena = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      await db.arenas.delete(id);
    }
  };

  const shareMatch = async (m: MatchEvent) => {
    const dateStr = format(m.date, "EEEE d MMMM yyyy, HH:mm", { locale: i18n.language === 'it' ? it : undefined });
    const text = `${t('agenda.sport.matchTitle')}: ${m.title}\n📅 ${t('agenda.sport.matchDate')}: ${dateStr}\n📍 ${t('agenda.sport.matchLocation')}: ${m.location}${m.notes ? `\n📝 ${t('agenda.sport.matchNotes')}: ${m.notes}` : ''}`;
    if (navigator.share) {
      try { await navigator.share({ title: t('common.shareInfo'), text }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success(t('common.shareSuccess', 'Dettagli copiati!'));
    }
  };

  const exportCalendar = () => {
    const icsContent = generateIcs(matches);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "partite.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCalendar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const importedEvents = parseIcs(text);
    let added = 0;
    for (const evt of importedEvents) {
      if (evt.date && evt.title) {
        await db.matches.put({
          id: evt.id || uuidv4(),
          title: evt.title,
          date: evt.date,
          location: evt.location || "",
          notes: evt.notes || "",
          reminders: evt.reminders?.length ? evt.reminders : [60],
          isSynced: true,
          externalId: evt.externalId,
        });
        added++;
      }
    }
    toast.success(t('common.importSuccessCount', { count: added }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">{t('agenda.sport.title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('agenda.sport.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'partite' && !showForm && (
            <>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} title={t('common.import')}>
                <Upload className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t('common.import')}</span>
              </Button>
              <input type="file" accept=".ics" ref={fileInputRef} className="hidden" onChange={importCalendar} />
              <Button variant="outline" size="sm" onClick={exportCalendar} title={t('common.export')}>
                <Download className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">{t('common.export')}</span>
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">{t('agenda.sport.newMatch')}</span>
              </Button>
            </>
          )}
          {activeTab === 'palazzetti' && !showArenaForm && (
            <Button onClick={() => setShowArenaForm(true)}>
              <Plus className="w-4 h-4 md:mr-1" />
              <span className="hidden md:inline">{t('agenda.sport.arenas.newArena')}</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2 flex-col sm:flex-row justify-between">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'partite' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => { setActiveTab('partite'); setShowArenaForm(false); }}
          >
            {t('agenda.sport.tabs.matches')}
          </Button>
          <Button 
            variant={activeTab === 'palazzetti' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => { setActiveTab('palazzetti'); setShowForm(false); }}
          >
            {t('agenda.sport.tabs.arenas')}
          </Button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <Input 
            placeholder={t('common.search')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 w-full sm:w-64 bg-slate-900 border-slate-800"
          />
        </div>
      </div>

      {/* ------------ PARTITE SECTION ------------ */}
      {activeTab === 'partite' && (
        <>
          {showForm ? (
            <Card className="mb-8 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-black italic">{editingId ? t('agenda.sport.editMatch') : t('agenda.sport.newMatch')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveMatch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('agenda.sport.matchTitle')}</Label>
                    <Input id="title" placeholder="es. Scapoli contro Ammogliati" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">{t('agenda.sport.matchDate')}</Label>
                    <Input id="date" type="datetime-local" value={formData.date ? format(typeof formData.date === 'string' ? new Date(formData.date) : formData.date, "yyyy-MM-dd'T'HH:mm") : ""} onChange={e => setFormData({...formData, date: new Date(e.target.value)})} required />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="location">{t('agenda.sport.matchLocation')}</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="location" 
                        className="flex-1" 
                        placeholder="es. Centro Sportivo, Via Roma 1" 
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})} 
                        required 
                      />
                      {arenas.length > 0 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowAddressPicker(!showAddressPicker)}
                          title="Scegli da indirizzi salvati"
                          className="shrink-0 aspect-square p-0 w-10 flex items-center justify-center border-slate-700 bg-slate-800/50"
                        >
                          <Book className="w-4 h-4 text-emerald-400" />
                        </Button>
                      )}
                    </div>

                    {showAddressPicker && arenas.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-48 overflow-y-auto">
                        <div className="p-2 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950/50">
                          {t('agenda.sport.arenas.title')}
                        </div>
                        <div className="flex flex-col">
                          {arenas.map(arena => (
                            <button
                              key={arena.id}
                              type="button"
                              className="w-full text-left p-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                              onClick={() => {
                                setFormData({...formData, location: arena.address});
                                setShowAddressPicker(false);
                              }}
                            >
                              <p className="font-bold text-sm text-slate-200">{arena.name}</p>
                              <p className="text-xs text-slate-400 truncate">{arena.address}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminders">{t('common.reminders')} ({t('common.minutes')})</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="reminders" 
                        type="number" 
                        min="0"
                        placeholder="Es. 60" 
                        value={formData.reminders?.[0] ?? ""} 
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          setFormData({...formData, reminders: isNaN(val) ? [] : [val]});
                        }} 
                      />
                      <select 
                        className="w-32 rounded-md border border-slate-800 bg-slate-800 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.reminders?.[0] ?? ""}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) setFormData({...formData, reminders: [val]});
                        }}
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="60">1 ora</option>
                        <option value="120">2 ore</option>
                        <option value="1440">1 giorno</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('agenda.sport.matchNotes')}</Label>
                    <Textarea id="notes" placeholder="Portare i palloni, quote da raccogliere..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('common.save')}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className={cn("grid grid-cols-1 xl:grid-cols-12 auto-rows-min gap-4 xl:gap-6", matches.length === 0 ? "h-auto" : "")}>
              {matches.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.location.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="xl:col-span-12 text-center py-20 text-slate-500 border border-dashed rounded-3xl border-slate-700 bg-slate-900/50">
                  <Calendar className="w-16 h-16 mx-auto mb-6 opacity-40 text-indigo-500" />
                  <p className="text-lg font-medium text-slate-400 mb-4">{t('agenda.sport.empty')}</p>
                  <Button onClick={() => {setShowForm(true); setSearchQuery('');}}>{t('agenda.sport.addFirst')}</Button>
                </div>
              ) : (
                matches.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.location.toLowerCase().includes(searchQuery.toLowerCase())).map((m, index) => {
                  const isFirst = index === 0;
                  if (isFirst) {
                    return (
                      <React.Fragment key={m.id}>
                        <Card className="xl:col-span-7 xl:row-span-2 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <MapIcon className="w-48 h-48" />
                          </div>
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">{t('common.nextMeeting')}</span>
                              <div className="flex bg-slate-800/80 md:bg-slate-800 backdrop-blur-sm rounded-full p-1 opacity-100 gap-1 border border-slate-700/50">
                                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors" onClick={() => handleEditMatch(m)}><Edit2 className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-slate-300 hover:text-red-400 hover:bg-slate-700 active:bg-red-500/20 transition-colors" onClick={() => handleDeleteMatch(m.id)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black mb-2 italic uppercase tracking-tight line-clamp-2 md:line-clamp-none">{m.title}</h2>
                            <div className="flex text-lg md:text-xl text-slate-400 font-light pr-4 max-w-full">
                              <MapPin className="w-5 h-5 mr-2 shrink-0 mt-1 line-clamp-1" /> <span className="truncate">{m.location}</span>
                            </div>
                          </div>
                          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between mt-8 md:mt-16 gap-4">
                            <div>
                              <p className="text-5xl md:text-6xl font-bold tabular-nums tracking-tighter text-indigo-400">{format(m.date, "HH:mm")}</p>
                              <p className="text-slate-400 font-medium mt-1 uppercase tracking-wider">{format(m.date, "EEEE, d MMMM", { locale: i18n.language === 'it' ? it : undefined })}</p>
                            </div>
                            {m.notes && (
                              <div className="hidden sm:block max-w-[200px] text-sm text-slate-500 text-right italic line-clamp-3">
                                {m.notes}
                              </div>
                            )}
                          </div>
                        </Card>

                        <Card className="xl:col-span-5 xl:row-span-1 group !p-0 hidden sm:block">
                          <div className="w-full h-full min-h-[200px] xl:min-h-[240px] relative">
                            <div className="absolute inset-0 bg-slate-800 opacity-60 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                              <MapIcon className="w-24 h-24 text-slate-700" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6 w-full flex justify-between items-end border-t border-slate-800 bg-slate-900/60 backdrop-blur-sm">
                              <div className="w-3/4">
                                <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-widest">{t('common.navigation')}</p>
                                <p className="text-lg font-bold truncate pr-4 text-white">{m.location}</p>
                              </div>
                              <Button className="w-12 h-12 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl shadow-xl flex items-center justify-center shrink-0 p-0" onClick={() => openNavigation(m.location)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                              </Button>
                            </div>
                          </div>
                        </Card>

                        <div className="xl:col-span-5 xl:row-span-1 grid grid-cols-2 gap-4 xl:gap-6">
                          <Card className="flex flex-col justify-between h-full hover:bg-slate-800/80 transition-colors p-5 cursor-pointer border-slate-700/50 min-h-[140px]" onClick={() => shareMatch(m)}>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('common.shareInfo')}</div>
                            <div className="bg-indigo-500/20 text-indigo-400 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-2 mx-auto sm:mx-0">
                               <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-300 text-center sm:text-left line-clamp-2">{t('common.share')}</p>
                          </Card>
                          <Card className="flex flex-col justify-between h-full bg-indigo-900/20 border-indigo-500/20 p-5 min-h-[140px]">
                            <div className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest mb-2">{t('common.reminders')}</div>
                            <div className="bg-indigo-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center mb-2 mx-auto sm:mx-0">
                              <Bell className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <p className="text-sm font-medium text-indigo-200 text-center sm:text-left">{t('common.active')} ({m.reminders[0]} {t('common.minutes')})</p>
                          </Card>
                        </div>
                      </React.Fragment>
                    );
                  } else {
                    return (
                      <Card key={m.id} className="xl:col-span-4 p-5 hover:border-slate-600 transition-colors flex flex-col relative group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-2xl font-bold tracking-tighter tabular-nums text-slate-200">{format(m.date, "dd MMM")}</div>
                            <div className="text-sm text-slate-400 font-medium">{format(m.date, "HH:mm")}</div>
                          </div>
                          <div className="flex bg-slate-800/80 md:bg-slate-800 backdrop-blur-sm rounded-full p-1 opacity-100 gap-1 border border-slate-700/50">
                            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors" onClick={() => handleEditMatch(m)}><Edit2 className="w-4 h-4" /></button>
                            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-slate-700 active:bg-red-500/20 transition-colors" onClick={() => handleDeleteMatch(m.id)}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="flex-1 min-h-[4rem]">
                          <h3 className="font-bold text-lg leading-tight mb-2 uppercase line-clamp-2 text-slate-100">{m.title}</h3>
                          <p className="text-xs text-slate-400 truncate flex items-center"><MapPin className="w-3 h-3 mr-1 shrink-0" /> {m.location}</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                          <Button variant="secondary" size="sm" className="flex-1 py-1 h-8 bg-slate-800 hover:bg-indigo-600 text-xs" onClick={() => openNavigation(m.location)}>{t('common.navigation')}</Button>
                          <Button variant="secondary" size="sm" className="flex-1 py-1 h-8 bg-slate-800 hover:bg-slate-700 text-xs" onClick={() => shareMatch(m)}>{t('common.share')}</Button>
                        </div>
                      </Card>
                    )
                  }
                })
              )}
            </div>
          )}
        </>
      )}

      {/* ------------ PALAZZETTI SECTION ------------ */}
      {activeTab === 'palazzetti' && (
        <>
          {showArenaForm ? (
            <Card className="mb-8 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-black italic">{editingArenaId ? t('agenda.sport.arenas.editArena') : t('agenda.sport.arenas.newArena')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveArena} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="arena_name">{t('agenda.sport.arenas.name')}</Label>
                    <Input id="arena_name" placeholder="es. PalaLido" value={arenaFormData.name} onChange={e => setArenaFormData({...arenaFormData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arena_address">{t('agenda.sport.arenas.address')}</Label>
                    <Input id="arena_address" placeholder="es. Viale dello Sport 1, Milano" value={arenaFormData.address} onChange={e => setArenaFormData({...arenaFormData, address: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arena_contacts">{t('agenda.sport.arenas.contacts')}</Label>
                    <Input id="arena_contacts" placeholder="es. 02 1234567" value={arenaFormData.contacts} onChange={e => setArenaFormData({...arenaFormData, contacts: e.target.value})} />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowArenaForm(false); setEditingArenaId(null); }}>{t('common.cancel')}</Button>
                    <Button type="submit">{t('common.save')}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6", arenas.length === 0 ? "h-auto" : "")}>
              {arenas.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.address.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-slate-500 border border-dashed rounded-3xl border-slate-700 bg-slate-900/50">
                  <MapIcon className="w-16 h-16 mx-auto mb-6 opacity-40 text-emerald-500" />
                  <p className="text-lg font-medium text-slate-400 mb-4">{t('agenda.sport.arenas.empty')}</p>
                  <Button onClick={() => {setShowArenaForm(true); setSearchQuery('');}}>{t('agenda.sport.arenas.addFirst')}</Button>
                </div>
              ) : (
                arenas.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.address.toLowerCase().includes(searchQuery.toLowerCase())).map((a) => (
                  <Card key={a.id} className="p-5 hover:border-emerald-600/50 transition-colors flex flex-col relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-900/40 p-3 rounded-2xl">
                        <MapIcon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex bg-slate-800/80 md:bg-slate-800 backdrop-blur-sm rounded-full p-1 opacity-100 gap-1 border border-slate-700/50">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors" onClick={() => handleEditArena(a)}><Edit2 className="w-4 h-4" /></button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-slate-700 active:bg-red-500/20 transition-colors" onClick={() => handleDeleteArena(a.id)}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-[4rem]">
                      <h3 className="font-bold text-lg leading-tight mb-2 uppercase text-slate-100">{a.name}</h3>
                      <p className="text-sm text-slate-400 flex items-start mb-2">
                        <MapPin className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-slate-500" /> 
                        <span className="line-clamp-2">{a.address}</span>
                      </p>
                      {a.contacts && (
                        <p className="text-sm text-slate-400 flex items-center">
                          <Phone className="w-4 h-4 mr-2 shrink-0 text-slate-500" /> 
                          {a.contacts}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                      <Button variant="secondary" size="sm" className="flex-1 py-1 h-8 bg-slate-800 hover:bg-emerald-600 text-xs" onClick={() => openNavigation(a.address)}>{t('agenda.sport.arenas.navigate')}</Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
