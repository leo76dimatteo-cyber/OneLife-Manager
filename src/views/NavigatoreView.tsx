import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "../components/ui";
import { MapPin as MapIcon, Navigation, Search, Flag, MapPin } from "lucide-react";
import { cn } from "../lib/utils";

export function NavigatoreView() {
  const arenas = useLiveQuery(() => db.arenas.orderBy("name").toArray()) || [];
  const [destination, setDestination] = useState("");
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (dest: string) => {
    if (dest.trim()) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`, "_blank");
    }
  };

  const searchOnMap = (dest: string) => {
    if (dest.trim()) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`, "_blank");
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(destination);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOnMap(destination);
  };

  const filteredArenas = arenas.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.address.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">Navigatore GPS</h2>
        <p className="text-slate-400 text-sm mt-1">Trova luoghi di incontro e avvia la navigazione</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <Card className="lg:col-span-5 p-0 overflow-hidden flex flex-col min-h-[400px]">
          <CardHeader className="bg-slate-900 border-b border-slate-800">
            <CardTitle className="text-xl flex items-center gap-2"><Search className="w-5 h-5 text-indigo-400" /> Cerca Destinazione</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">
            <form onSubmit={handleNavigate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="destination">Indirizzo o Nome del Luogo</Label>
                <Input 
                  id="destination" 
                  placeholder="es. Stadio Olimpico, Roma" 
                  value={destination} 
                  onChange={e => setDestination(e.target.value)} 
                  className="h-12 md:h-14 text-base md:text-lg"
                  required 
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" className="w-full h-12 md:h-14 text-base md:text-lg" disabled={!destination.trim()}>
                  <Navigation className="w-5 h-5 mr-2" /> Avvia Navigazione
                </Button>
                <Button type="button" variant="secondary" size="lg" className="w-full h-12 md:h-14 text-base md:text-lg" disabled={!destination.trim()} onClick={handleSearch}>
                  <MapIcon className="w-5 h-5 mr-2" /> Guarda sulla Mappa
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7 bg-slate-800 border-slate-700 min-h-[400px] flex flex-col p-0">
          <CardHeader className="bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <CardTitle className="text-xl flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-400" /> I Tuoi Palazzetti</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input 
                placeholder="Filtra palazzetti..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full bg-slate-950 border-slate-800"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[400px]">
            {filteredArenas.length === 0 ? (
               <div className="text-center py-12 text-slate-500">
                 <MapIcon className="w-12 h-12 mx-auto mb-4 opacity-40 text-slate-400" />
                 <p>Nessun palazzetto trovato in rubrica.</p>
               </div>
            ) : (
              <div className="space-y-3">
                {filteredArenas.map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-white mb-1 line-clamp-1">{a.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{a.address}</p>
                    </div>
                    <Button size="icon" onClick={() => navigateTo(a.address)} className="shrink-0 rounded-full w-10 h-10 bg-indigo-600 hover:bg-indigo-500">
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
