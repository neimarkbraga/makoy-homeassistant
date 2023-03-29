import './air-purifier-card';
import './humidifier-card';
// import './smart-fan-card';

const getSidebarItemsShadowRoot = (element: Element): HTMLElement[] => {
  if (element.shadowRoot) {
    const links = element.shadowRoot.querySelectorAll<HTMLElement>('* > a[data-panel]');
    if (links.length) return Array.from(links);
  }

  const items = Array.from((element.shadowRoot ?? element).querySelectorAll('*'));
  for (const item of items) {
    const result = getSidebarItemsShadowRoot(item);
    if (result) return result;
  }

  return null;
};

(window as any).hassConnection.then((hass) => {
  if (hass.conn._usr.state.is_admin) return;
  const items = getSidebarItemsShadowRoot(document.body);
  for (const item of items) {
    const panelsToHide = ['energy', 'map', 'logbook', 'history', 'hacs', 'media-browser'];
    if (panelsToHide.includes(item.getAttribute('data-panel'))) item.style.display = 'none';
  }
});
