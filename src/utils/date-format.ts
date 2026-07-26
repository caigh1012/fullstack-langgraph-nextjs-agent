/**
 * 格式化日期为 YYYY/MM/DD HH:mm:ss
 * @param date
 * @returns
 */
export const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
