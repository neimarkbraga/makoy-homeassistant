const { hassConnection } = window as any;

if (hassConnection)
  hassConnection.then((hass) => {
    if (hass.conn._usr.state.is_admin) return;

    const storageKey = 'sidebarHiddenPanels';
    const sidebarHiddenPanels = localStorage.getItem(storageKey);
    const itemsToHide = ['hacs', 'history', 'media-browser', 'logbook', 'map', 'energy'];

    if (sidebarHiddenPanels) {
      const hiddenPanels = JSON.parse(sidebarHiddenPanels);
      if (hiddenPanels.length === itemsToHide.length) return;
    }

    localStorage.setItem(storageKey, JSON.stringify(itemsToHide));
    window.location.reload();
  });
