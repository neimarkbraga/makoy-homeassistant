export const paddingLeft = (value: number, length: number, padding: string) => {
  let result = String(value);
  if (padding) {
    while (result.length < length) result = padding + result;
  }
  return result;
};

export const deepQuerySelector: typeof document.querySelector = (selectors) => {
  return (function findIn(element: Element) {
    const value = (element.shadowRoot ?? element).querySelector(selectors);
    if (value) return value;

    for (const child of element.children) {
      const value = findIn(child);
      if (value) return value;
    }

    for (const shadowRootChild of element.shadowRoot?.children ?? []) {
      const value = findIn(shadowRootChild);
      if (value) return value;
    }

    return null;
  })(document.body);
};

export const getHomeAssistant = () => {
  return ((window as any).hassConnection as Partial<Record<string, any>>) ?? null;
};
