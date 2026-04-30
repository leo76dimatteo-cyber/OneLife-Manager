export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const openNavigation = (location: string) => {
  if (!location.trim()) return;
  
  const encodedDest = encodeURIComponent(location);
  if (isIOS()) {
    window.open(`maps://maps.apple.com/?daddr=${encodedDest}`, "_blank");
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`, "_blank");
  }
};
