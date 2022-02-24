import { SVGPathData } from 'svg-pathdata';
import { isDevelopment } from '../libs/debug';

type RequireContext = __WebpackModuleApi.RequireContext;

interface IconsMap {
  [key: string]: {
    keywords: string[]
    path: string
  }
}

interface BoxData {
  x: number
  y: number
  width: number
  height: number
}

// extract svg list from require context
const extractSvgListFromDir = (rCtx: RequireContext): string[][] => {
  return rCtx.keys().map(key => [
    key.replace(/^\.\/(.*)\.svg/, '$1'),
    rCtx(key).default
  ]);
};

// extracts first detected svg in html string
const extractSvgFromHtml = (html: string): Element | null => {
  const findSvg = (children: HTMLCollection): Element | null => {
    for (const child of Array.from(children)) {
      if (/^svg$/i.test(child.tagName)) return child;

      if (!!child.children.length) {
        const svg = findSvg(child.children);
        if (svg) return svg;
      }
    }
  };

  const el = document.createElement('div');
  el.innerHTML = html;

  return findSvg(el.children);
};

// extracts combined path of an svg
const extractSvgPath = (svg: Element): string => {
  const paths: string[] = [];
  const scan = (children: HTMLCollection) => {
    for (const child of Array.from(children)) {
      if (!!child.children.length) scan(child.children);
      if (!/^path$/i.test(child.tagName)) continue;
      paths.push(child.getAttribute('d') || '');
    }
  };
  scan(svg.children);
  return paths.filter(a => a).join(' ');
};

// extracts box data of an svg
const extractBoxData = (svg: Element): BoxData => {
  const result = {x: 0, y: 0, width: 0, height: 0};
  const viewBox = svg.getAttribute('viewBox');

  result.x = Number(svg.getAttribute('x') || 0);
  result.y = Number(svg.getAttribute('y') || 0);
  result.width = Number(svg.getAttribute('width') || 0);
  result.height =  Number(svg.getAttribute('height') || 0);

  if (viewBox) {
    const [_x, _y, _width, _height] = viewBox.split(' ');
    result.x = Number(_x);
    result.y = Number(_y);
    result.width = Number(_width);
    result.height = Number(_height);
  }

  return result;
}

// builds svg icons and register it to window
const buildSvgIcons = (collectionName: string, rCtx: RequireContext) => {
  const icons = extractSvgListFromDir(rCtx);
  const iconsMap: IconsMap = {};

  for (const [name, html] of icons) {
    // extract values
    const svg = extractSvgFromHtml(html);
    if (!svg) continue;

    const path = extractSvgPath(svg);
    if (!path.length) continue;

    const { x, y, width, height } = extractBoxData(svg);
    const pathData = new SVGPathData(path);
    const scale = 24 / Math.max(width, height);

    // fix position
    if (x !== 0 || y !== 0) pathData.translate(0 - x, 0 - y);
    if (width > height) pathData.translate(0, (width - height) / 2);
    if (height > width) pathData.translate((height - width) / 2, 0);

    // scale to standard size
    pathData.scale(scale, scale);

    // add to map
    iconsMap[name] = {
      keywords: [],
      path: pathData.encode()
    };
  }

  // build interface
  const getIcon = (name: string): { path: string } => {
    return { path: iconsMap[name]?.path };
  };

  const getIconList = () => {
    return Object.entries(iconsMap).map(([icon, content]) => ({
      name: icon,
      keywords: content.keywords,
    }));
  };

  if (isDevelopment) collectionName = `dev_${collectionName}`;

  // register to custom icons
  window.customIcons = window.customIcons || {};
  window.customIcons[collectionName] = { getIcon, getIconList };

  // register to custom icon sets
  window.customIconsets = window.customIconsets || {};
  window.customIconsets[collectionName] = getIcon;
};

// build icons
buildSvgIcons('mak', require.context('./mak-icons', false, /\.svg$/));