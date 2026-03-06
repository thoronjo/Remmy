export const sanitize = (value, maxLength = 2000) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
};
