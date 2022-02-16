import { parse } from 'svg-parser';
import { SVGPathData } from 'svg-pathdata';

const icons = require.context('./icons', false, /\.svg$/);
const ICONS_MAP = {};

for (const key of icons.keys()) {
  const svgProps = {};
  const paths = [];
  const scan = (children) => {
    for (const child of children) {
      if (/^svg$/i.test(child.tagName))
        Object.assign(svgProps, child.properties);

      if (child.children.length)
        scan(child.children);

      if (/^path$/i.test(child.tagName) && child.properties.d)
        paths.push(child.properties.d);
    }
  };
  scan(parse(icons(key)).children);

  const [_x, _y, _width, _height] = svgProps.viewBox.split(' ');
  const x = Number(_x);
  const y = Number(_y);
  const width = Number(_width);
  const height = Number(_height);
  const pathData = new SVGPathData(paths.join(' '));
  const scale = (() => {
    return 24 / Math.max(width, height);
  })();

  if (x !== 0 || y !== 0) pathData.translate(0 - x, 0 - y);
  if (width > height) pathData.translate(0, (width - height) / 2);
  if (height > width) pathData.translate((height - width) / 2, 0);

  pathData.scale(scale, scale);

  ICONS_MAP[key.replace(/^\.\/(.*)\.svg/, '$1')] = {
    keywords: [],
    path: pathData.encode()
  };
}

const getIcon = (name) => {
  return { path: ICONS_MAP[name]?.path };
};

const getIconList = () => {
  return Object.entries(ICONS_MAP).map(([icon, content]) => ({
    name: icon,
    keywords: content.keywords,
  }));
};

const preview = () => {
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    width: '100vw',
    height: '100vh',
    left: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: '9999'
  });

  const dialog = document.createElement('div');
  Object.assign(dialog.style, {
    width: '90vw',
    maxWidth: '1000px',
    maxHeight: '90vh',
    backgroundColor: '#FFFFFF',
    color: 'black',
    fontSize: '17px',
    overflow: 'auto'
  });
  overlay.append(dialog);

  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '15px'
  });
  dialog.append(header);

  const closeButton = document.createElement('button');
  closeButton.innerHTML = 'Close';
  closeButton.onclick = () => overlay.remove();
  header.append(closeButton);

  const body = document.createElement('div');
  dialog.append(body);

  for (const icon of getIconList()) {
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      display: 'inline-block',
      padding: '15px',
      textAlign: 'center',
      width: '16.66%'
    });
    body.append(wrapper);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
    wrapper.append(svg);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', getIcon(icon.name).path);
    svg.append(path);

    const text = document.createElement('p');
    text.innerHTML = `mak:${icon.name}`;
    wrapper.append(text);
  }

  document.body.append(overlay);
};

window.customIcons = window.customIcons || {};
window.customIcons["mak"] = { getIcon, getIconList, preview };

window.customIconsets = window.customIconsets || {};
window.customIconsets["mak"] = getIcon;