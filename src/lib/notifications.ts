export const playNotificationSound = () => {
  try {
    // Utilizziamo un segnale acustico standard del browser o un file audio esterno se necessario
    // Per ora utilizziamo l'AudioContext per generare un suono "ping" pulito senza dipendere da file esterni
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Nota La5
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (error) {
    console.warn("Riproduzione audio non riuscita (potrebbe richiedere interazione utente):", error);
  }
};
