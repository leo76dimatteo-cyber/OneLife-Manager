import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  it: {
    translation: {
      "app": {
        "name": "OneLife Manager",
        "description": "La tua agenda sportiva e personale definitiva."
      },
      "nav": {
        "dashboard": "Dashboard",
        "agenda-sport": "Agenda Sportiva",
        "agenda-personal": "Agenda Personale",
        "rubrica": "Rubrica",
        "navigatore": "Navigatore",
        "impostazioni": "Impostazioni",
        "guida": "Guida",
        "menu": "Menu Principale",
        "logout": "Esci",
        "enable-notifications": "Abilita Notifiche",
        "notifications-on": "Notifiche On",
        "test-notification": "Test Notifica",
        "language": "Lingua"
      },
      "settings": {
        "title": "Impostazioni",
        "subtitle": "Gestisci il tuo profilo e i tuoi dati",
        "theme": "Tema e Colori",
        "theme-desc": "Personalizza il colore del bordo delle finestre con tinte vivaci e fluorescenti.",
        "language": "Lingua Applicazione",
        "language-desc": "Scegli la lingua preferita per l'interfaccia.",
        "account": "Sicurezza Account",
        "logged-as": "Loggato come:",
        "new-password": "Nuova Password",
        "confirm-password": "Conferma Nuova Password",
        "update-password": "Aggiorna Password",
        "backup": "Backup e Ripristino",
        "backup-desc": "Esporta tutti i tuoi dati (eventi, contatti, palazzetti) in un file JSON.",
        "backup-btn": "Effettua Backup",
        "restore-desc": "Ripristina i dati da un file di backup precedente.",
        "restore-warn": "Attenzione: questo sovrascriverà tutti i dati attuali!",
        "restore-btn": "Ripristina da Backup",
        "pass-mismatch": "Le password non coincidono",
        "auth-error": "Utente non autenticato",
        "pass-success": "Password aggiornata con successo!",
        "backup-error": "Errore durante il backup dei dati",
        "restore-success": "Dati ripristinati con successo!",
        "restore-error": "Errore durante il ripristino dei dati. Verifica che il file sia corretto."
      },
      "dashboard": {
        "title": "Dashboard",
        "subtitle": "Storico Impegni della Settimana",
        "this-week": "Questa Settimana",
        "no-events": "Nessun impegno previsto per questa settimana.",
        "sportive": "Sportivo",
        "personal": "Personale",
        "online": "Online"
      },
      "common": {
        "loading": "Caricamento...",
        "user": "Utente",
        "today": "Oggi",
        "at": "alle"
      }
    }
  },
  en: {
    translation: {
      "app": {
        "name": "OneLife Manager",
        "description": "Your ultimate sports and personal agenda."
      },
      "nav": {
        "dashboard": "Dashboard",
        "agenda-sport": "Sports Agenda",
        "agenda-personal": "Personal Agenda",
        "rubrica": "Contacts",
        "navigatore": "Navigator",
        "impostazioni": "Settings",
        "guida": "Guide",
        "menu": "Main Menu",
        "logout": "Logout",
        "enable-notifications": "Enable Notifications",
        "notifications-on": "Notifications On",
        "test-notification": "Test Notification",
        "language": "Language"
      },
      "settings": {
        "title": "Settings",
        "subtitle": "Manage your profile and data",
        "theme": "Theme and Colors",
        "theme-desc": "Customize the window border color with vibrant and fluorescent shades.",
        "language": "App Language",
        "language-desc": "Choose your preferred language for the interface.",
        "account": "Account Security",
        "logged-as": "Logged in as:",
        "new-password": "New Password",
        "confirm-password": "Confirm New Password",
        "update-password": "Update Password",
        "backup": "Backup and Restore",
        "backup-desc": "Export all your data (events, contacts, venues) to a JSON file.",
        "backup-btn": "Perform Backup",
        "restore-desc": "Restore data from a previous backup file.",
        "restore-warn": "Attention: this will overwrite all current data!",
        "restore-btn": "Restore from Backup",
        "pass-mismatch": "Passwords do not match",
        "auth-error": "User not authenticated",
        "pass-success": "Password updated successfully!",
        "backup-error": "Error during data backup",
        "restore-success": "Data restored successfully!",
        "restore-error": "Error during data restoration. Check if the file is correct."
      },
      "dashboard": {
        "title": "Dashboard",
        "subtitle": "Weekly Commitments Overview",
        "this-week": "This Week",
        "no-events": "No events scheduled for this week.",
        "sportive": "Sports",
        "personal": "Personal",
        "online": "Online"
      },
      "common": {
        "loading": "Loading...",
        "user": "User",
        "today": "Today",
        "at": "at"
      }
    }
  },
  es: {
    translation: {
      "app": {
        "name": "OneLife Manager",
        "description": "Tu agenda deportiva y personal definitiva."
      },
      "nav": {
        "dashboard": "Tablero",
        "agenda-sport": "Agenda Deportiva",
        "agenda-personal": "Agenda Personal",
        "rubrica": "Contactos",
        "navigatore": "Navegador",
        "impostazioni": "Ajustes",
        "guida": "Guía",
        "menu": "Menú Principal",
        "logout": "Cerrar sesión",
        "enable-notifications": "Activar notificaciones",
        "notifications-on": "Notificaciones activas",
        "test-notification": "Probar notificación",
        "language": "Idioma"
      },
      "settings": {
        "title": "Ajustes",
        "subtitle": "Gestiona tu perfil y tus datos",
        "theme": "Tema y Colores",
        "theme-desc": "Personaliza el color del borde de las ventanas con tonos vibrantes y fluorescentes.",
        "language": "Idioma de la aplicación",
        "language-desc": "Elige tu idioma preferido para la interfaz.",
        "account": "Seguridad de la cuenta",
        "logged-as": "Conectado como:",
        "new-password": "Nueva contraseña",
        "confirm-password": "Confirmar nueva contraseña",
        "update-password": "Actualizar contraseña",
        "backup": "Copia de seguridad y restauración",
        "backup-desc": "Exporta todos tus datos (eventos, contactos, recintos) a un archivo JSON.",
        "backup-btn": "Realizar copia de seguridad",
        "restore-desc": "Restaura datos de un archivo de copia de seguridad anterior.",
        "restore-warn": "Atención: ¡esto sobrescribirá todos los datos actuales!",
        "restore-btn": "Restaurar desde copia de seguridad",
        "pass-mismatch": "Las contraseñas no coinciden",
        "auth-error": "Usuario no autenticado",
        "pass-success": "¡Contraseña actualizada con éxito!",
        "backup-error": "Error durante la copia de seguridad de datos",
        "restore-success": "¡Datos restaurados con éxito!",
        "restore-error": "Error durante la restauración de datos. Comprueba si el archivo es correcto."
      },
      "dashboard": {
        "title": "Tablero",
        "subtitle": "Resumen de compromisos semanales",
        "this-week": "Esta semana",
        "no-events": "No hay eventos programados para esta semana.",
        "sportive": "Deportivo",
        "personal": "Personal",
        "online": "En línea"
      },
      "common": {
        "loading": "Cargando...",
        "user": "Usuario",
        "today": "Hoy",
        "at": "a las"
      }
    }
  },
  fr: {
    translation: {
      "app": {
        "name": "OneLife Manager",
        "description": "Votre agenda sportif et personnel ultime."
      },
      "nav": {
        "dashboard": "Tableau de bord",
        "agenda-sport": "Agenda Sportif",
        "agenda-personal": "Agenda Personnel",
        "rubrica": "Contacts",
        "navigatore": "Navigateur",
        "impostazioni": "Paramètres",
        "guida": "Guide",
        "menu": "Menu Principal",
        "logout": "Déconnexion",
        "enable-notifications": "Activer les notifications",
        "notifications-on": "Notifications activées",
        "test-notification": "Tester la notification",
        "language": "Langue"
      },
      "settings": {
        "title": "Paramètres",
        "subtitle": "Gérez votre profil et vos données",
        "theme": "Thème et Couleurs",
        "theme-desc": "Personnalisez la couleur de la bordure des fenêtres avec des teintes vives et fluorescentes.",
        "language": "Langue de l'application",
        "language-desc": "Choisissez votre langue préférée pour l'interface.",
        "account": "Sécurité du compte",
        "logged-as": "Connecté en tant que :",
        "new-password": "Nouveau mot de passe",
        "confirm-password": "Confirmer le nouveau mot de passe",
        "update-password": "Mettre à jour le mot de passe",
        "backup": "Sauvegarde et Restauration",
        "backup-desc": "Exportez toutes vos données (événements, contacts, lieux) vers un fichier JSON.",
        "backup-btn": "Effectuer une sauvegarde",
        "restore-desc": "Restaurer les données à partir d'un fichier de sauvegarde précédent.",
        "restore-warn": "Attention : cela écrasera toutes les données actuelles !",
        "restore-btn": "Restaurer à partir d'une sauvegarde",
        "pass-mismatch": "Les mots de passe ne correspondent pas",
        "auth-error": "Utilisateur non authentifié",
        "pass-success": "Mot de passe mis à jour avec succès !",
        "backup-error": "Erreur lors de la sauvegarde des données",
        "restore-success": "Données restaurées avec succès !",
        "restore-error": "Erreur lors de la restauration des données. Vérifiez si le fichier est correct."
      },
      "dashboard": {
        "title": "Tableau de bord",
        "subtitle": "Aperçu des engagements hebdomadaires",
        "this-week": "Cette semaine",
        "no-events": "Aucun événement prévu pour cette semaine.",
        "sportive": "Sportif",
        "personal": "Personnel",
        "online": "En ligne"
      },
      "common": {
        "loading": "Chargement...",
        "user": "Utilisateur",
        "today": "Aujourd'hui",
        "at": "à"
      }
    }
  },
  hi: {
    translation: {
      "app": {
        "name": "OneLife Manager",
        "description": "आपका अंतिम खेल और व्यक्तिगत एजेंडा।"
      },
      "nav": {
        "dashboard": "डैशबोर्ड",
        "agenda-sport": "खेल एजेंडा",
        "agenda-personal": "व्यक्तिगत एजेंडा",
        "rubrica": "संपर्क",
        "navigatore": "नेविगेटर",
        "impostazioni": "सेटिंग्स",
        "guida": "मार्गदर्शिका",
        "menu": "मुख्य मेनू",
        "logout": "लॉगआउट",
        "enable-notifications": "सूचनाएं सक्षम करें",
        "notifications-on": "सूचनाएं चालू",
        "test-notification": "परीक्षण सूचना",
        "language": "भाषा"
      },
      "settings": {
        "title": "सेटिंग्स",
        "subtitle": "अपनी प्रोफाइल और डेटा प्रबंधित करें",
        "theme": "थीम और रंग",
        "theme-desc": "जीवंत और फ्लोरोसेंट रंगों के साथ विंडो बॉर्डर रंग को कस्टमाइज़ करें।",
        "language": "ऐप की भाषा",
        "language-desc": "इंटरफ़ेस के लिए अपनी पसंदीदा भाषा चुनें।",
        "account": "खाता सुरक्षा",
        "logged-as": "इस रूप में लॉग इन किया:",
        "new-password": "नया पासवर्ड",
        "confirm-password": "नए पासवर्ड की पुष्टि करें",
        "update-password": "पासवर्ड अपडेट करें",
        "backup": "बैकअप और पुनर्स्थापना",
        "backup-desc": "अपने सभी डेटा (ईवेंट, संपर्क, स्थान) को JSON फ़ाइल में निर्यात करें।",
        "backup-btn": "बैकअप लें",
        "restore-desc": "पिछली बैकअप फ़ाइल से डेटा पुनर्स्थापित करें।",
        "restore-warn": "चेतावनी: यह सभी वर्तमान डेटा को अधिलेखित कर देगा!",
        "restore-btn": "बैकअप से पुनर्स्थापित करें",
        "pass-mismatch": "पासवर्ड मेल नहीं खाते",
        "auth-error": "उपयोगकर्ता प्रमाणित नहीं है",
        "pass-success": "पासवर्ड सफलतापूर्वक अपडेट किया गया!",
        "backup-error": "डेटा बैकअप के दौरान त्रुटि",
        "restore-success": "डेटा सफलतापूर्वक पुनर्स्थापित किया गया!",
        "restore-error": "डेटा पुनर्स्थापना के दौरान त्रुटि। जाँचें कि फ़ाइल सही है या नहीं।"
      },
      "dashboard": {
        "title": "डैशबोर्ड",
        "subtitle": "साप्ताहिक प्रतिबद्धता अवलोकन",
        "this-week": "इस सप्ताह",
        "no-events": "इस सप्ताह के लिए कोई कार्यक्रम निर्धारित नहीं है।",
        "sportive": "खेल",
        "personal": "व्यक्तिगत",
        "online": "ऑनलाइन"
      },
      "common": {
        "loading": "लोड हो रहा है...",
        "user": "उपयोगकर्ता",
        "today": "आज",
        "at": "बजे"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
