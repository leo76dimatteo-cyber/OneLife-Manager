import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Contact } from "../db/db";
import { cn } from "../lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "../components/ui";
import { Plus, Trash2, Edit2, Phone, Mail, User, Users, Search } from "lucide-react";

export function RubricaView() {
  const { t } = useTranslation();
  const contacts = useLiveQuery(() => db.contacts.orderBy("name").toArray()) || [];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'sport' | 'personal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: "",
    type: "sport",
    phone: "",
    email: "",
    notes: "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) return;

    if (editingId) {
      await db.contacts.put({
        ...formData,
        id: editingId,
      } as Contact);
    } else {
      await db.contacts.add({
        id: uuidv4(),
        name: formData.name,
        type: formData.type as 'sport' | 'personal',
        phone: formData.phone || "",
        email: formData.email || "",
        notes: formData.notes || "",
      });
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", type: "sport", phone: "", email: "", notes: "" });
  };

  const handleEdit = (c: Contact) => {
    setFormData({ ...c });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      await db.contacts.delete(id);
    }
  };

  const filteredContacts = contacts.filter(c => (filterType === 'all' || c.type === filterType) && (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.notes?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ) );

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">{t('contacts.title')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('contacts.subtitle')}</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('contacts.newContact')}</span>
            <span className="inline sm:hidden">Nuovo</span>
          </Button>
        )}
      </div>

      {!showForm && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-slate-800 pb-4 justify-between">
          <div className="flex gap-2 overflow-x-auto">
            <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}>{t('common.filterAll')}</Button>
            <Button variant={filterType === 'sport' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('sport')}>
              <Users className="w-4 h-4 mr-2" /> {t('common.filterSport')}
            </Button>
            <Button variant={filterType === 'personal' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('personal')}>
              <User className="w-4 h-4 mr-2" /> {t('common.filterPersonal')}
            </Button>
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <Input 
              placeholder={t('common.search')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-full bg-slate-900 border-slate-800"
            />
          </div>
        </div>
      )}

      {showForm ? (
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-black italic">{editingId ? t('contacts.editContact') : t('contacts.newContact')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('contacts.name')}</Label>
                <Input id="name" placeholder="Mario Rossi" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div className="space-y-2">
                <Label>{t('contacts.type')}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="accent-indigo-500" name="type" value="sport" checked={formData.type === 'sport'} onChange={() => setFormData({...formData, type: 'sport'})} />
                    <span className="text-slate-200">{t('contacts.sport')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" className="accent-indigo-500" name="type" value="personal" checked={formData.type === 'personal'} onChange={() => setFormData({...formData, type: 'personal'})} />
                    <span className="text-slate-200">{t('contacts.personal')}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('contacts.phone')}</Label>
                  <Input id="phone" type="tel" placeholder="+39 333 1234567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contacts.email')}</Label>
                  <Input id="email" type="email" placeholder="mario@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('contacts.notes')}</Label>
                <Textarea id="notes" placeholder="Ruolo, Squadra, etc..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>{t('common.cancel')}</Button>
                <Button type="submit">{t('common.save')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {!showForm && (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6", filteredContacts.length === 0 ? "h-auto" : "")}>
          {filteredContacts.length === 0 ? (
            <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-20 text-slate-500 border border-dashed rounded-3xl border-slate-700 bg-slate-900/50">
              <Users className="w-16 h-16 mx-auto mb-6 opacity-40 text-blue-500" />
              <p className="text-lg font-medium text-slate-400 mb-4">{t('contacts.empty')}</p>
              <Button onClick={() => setShowForm(true)}>{t('contacts.addFirst')}</Button>
            </div>
          ) : (
            filteredContacts.map((c) => (
              <Card key={c.id} className="p-5 hover:border-slate-600 transition-colors flex flex-col relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg", c.type === 'sport' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-emerald-900/50 text-emerald-400')}>
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100 leading-none">{c.name}</h3>
                      <span className="text-xs text-slate-500 uppercase tracking-widest mt-1 inline-block">{c.type === 'sport' ? t('contacts.sport') : t('contacts.personal')}</span>
                    </div>
                  </div>
                  <div className="flex bg-slate-800/80 md:bg-slate-800 backdrop-blur-sm rounded-full p-1 opacity-100 gap-1 border border-slate-700/50">
                    <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 active:bg-slate-600 transition-colors" onClick={() => handleEdit(c)}><Edit2 className="w-4 h-4" /></button>
                    <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-slate-700 active:bg-red-500/20 transition-colors" onClick={() => handleDelete(c.id)}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-3 mt-2 text-sm text-slate-300">
                  {c.phone && (
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-800 p-2 rounded-lg text-slate-400"><Phone className="w-4 h-4" /></div>
                      <a href={`tel:${c.phone}`} className="hover:text-indigo-400 transition-colors">{c.phone}</a>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-800 p-2 rounded-lg text-slate-400"><Mail className="w-4 h-4" /></div>
                      <a href={`mailto:${c.email}`} className="hover:text-indigo-400 transition-colors truncate">{c.email}</a>
                    </div>
                  )}
                  {c.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-800/50 text-xs text-slate-500 italic">
                      {c.notes}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
