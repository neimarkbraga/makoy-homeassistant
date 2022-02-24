export const paddingLeft = (value: number, length: number, padding: string) => {
  let result = String(value);
  if (padding) {
    while (result.length < length)
      result = padding + result;
  }
  return result;
};