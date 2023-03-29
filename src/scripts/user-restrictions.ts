import { deepQuerySelector, getHomeAssistant } from '../libs/utils';

(async () => {
  const hass = await getHomeAssistant();
  if (!hass || hass.conn._usr.state.is_admin) return;

  // remove search button
  const searchButton = deepQuerySelector('app-toolbar ha-icon-button');
  searchButton.remove();

  // hide sidebar items
  const itemsToHide = ['hacs', 'history', 'media-browser', 'logbook', 'map', 'energy'];
  for (const itemToHide of itemsToHide) {
    const item = deepQuerySelector(`a[data-panel="${itemToHide}"]`);
    item?.remove();
  }
})();
