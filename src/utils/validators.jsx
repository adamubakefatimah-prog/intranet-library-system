export const validators = {
  required: (v) => v !== undefined && v !== null && String(v).trim() !== '',
  year: (v) => {
    const y = Number(v);
    return !Number.isNaN(y) && y >= 1600 && y <= new Date().getFullYear();
  }
};
