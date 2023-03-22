/**
 * @param {Date} date текущий день
 * @return {Date} возвращает следующий рабочий день
 */
const getNextBusinessDay = (date) => {
  date = new Date(date);
  do {
    date.setDate(date.getDate() + 1);
  } while (!(date.getDay() % 6));
  return date;
};

/**
 * @param {Number} month номер месяца, начинается с 0
 * @param {Number} year Год, не отсчитываемый от нуля, необходим для учета високосных лет
 * @return {Date[]} Список с объектами даты для каждого дня месяца
 */
exports.getDaysInMonth = (month, year) => {
  let date = new Date(year, month, 1, 9);
  date = getNextBusinessDay(date);
  let days = [];
  while (date.getMonth() === month) {
    days.push(date);
    date = getNextBusinessDay(date);
  }
  return days;
};

/**
 * @param {Date} start date from
 * @param {Date} end date to
 * @return {Number} Разиница в часах между датами
 */
exports.getNumberOfHours = (start, end) => {
  const date1 = new Date(start);
  const date2 = new Date(end);
  return Math.floor((date2 - date1) / (1000 * 60 * 60));
};
