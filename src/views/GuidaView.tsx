import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { HelpCircle, LayoutDashboard, CalendarDays, User, Users, Navigation, Settings } from 'lucide-react';

export function GuidaView() {
  const sections = [
    {
      title: 'Dashboard Principale',
      icon: LayoutDashboard,
      description: 'La dashboard è il tuo centro di controllo. Qui puoi visualizzare lo storico e i prossimi impegni della settimana corrente, sia di natura sportiva che personale. Offre un colpo d\'occhio immediato su cosa ti aspetta nei prossimi giorni ed eventuali eventi passati della stessa settimana.',
    },
    {
      title: 'Agenda Sportiva',
      icon: CalendarDays,
      description: 'Questa funzione è progettata per gestire tutti i tuoi impegni relativi allo sport (partite, allenamenti, tornei). Puoi aggiungere nuovi eventi specificando la squadra, l\'avversario, la data, l\'ora e l\'impianto sportivo (palazzetto). C\'è anche una mappa interattiva (se viene fornita una posizione valida) e pulsanti per ottenere indicazioni stradali dirette tramite Google Maps o Waze.',
    },
    {
      title: 'Agenda Personale',
      icon: User,
      description: 'Registra qui i tuoi impegni quotidiani non sportivi: visite mediche, appuntamenti di lavoro, incontri, o promemoria generici. Puoi inserire titolo, descrizione e data/ora. Una volta salvato l\'evento, potrai modificarlo o eliminarlo rapidamente.',
    },
    {
      title: 'Rubrica',
      icon: Users,
      description: 'Una rubrica unificata per salvare i tuoi contatti. Puoi suddividerli per categoria: sportivi (ad es. allenatori, arbitri, compagni di squadra) o personali. È possibile specificare nome, numero di telefono, ruolo ed e-mail per avere tutti a portata di tocco.',
    },
    {
      title: 'Navigatore',
      icon: Navigation,
      description: 'Permette di cercare e avviare rapidamente la navigazione verso un luogo di interesse (ad esempio un palazzetto o uno stadio). Integrato con Google Maps, ti mostra un riquadro per avere subito le indicazioni o aprire la tua app di navigazione preferita.',
    },
    {
      title: 'Impostazioni',
      icon: Settings,
      description: 'Nella pagina impostazioni puoi: 1. Gestire la sicurezza del tuo account modificando la password. 2. Eseguire un backup completo dei tuoi dati esportandoli in un file JSON. 3. Ripristinare i dati importando un precedente backup. 4. Personalizzare l\'interfaccia cambiando il colore del bordo delle finestre con tinte vivaci o fluorescenti.',
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shadow-lg border border-indigo-500/30">
          <HelpCircle className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight text-white mb-1">Guida</h1>
          <p className="text-sm text-slate-400 font-medium">Scopri come utilizzare al meglio tutte le funzionalità di OneLife Manager</p>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Icon className="w-6 h-6 text-indigo-400" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
