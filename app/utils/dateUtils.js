/**
 * Date Utility Helpers
 */

const formatDate = (date = new Date(), format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  if (format === 'YYYY-MM-DD') {
    return `${yyyy}-${mm}-${dd}`;
  }
  if (format === 'DD/MM/YYYY') {
    return `${dd}/${mm}/${yyyy}`;
  }
  return d.toISOString();
};

const getTodayString = () => formatDate(new Date(), 'YYYY-MM-DD');

const isDateInRange = (date, startDate, endDate) => {
  const target = new Date(date).getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return target >= start && target <= end;
};

module.exports = {
  formatDate,
  getTodayString,
  isDateInRange
};
