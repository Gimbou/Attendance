export const nextDay = (x) => {
  var now = new Date();    
  now.setDate(now.getDate() + (x+(7-now.getDay())) % 7);
  return now;
}

export const nextEvent = () => {
	var date = new Date(nextDay(4).toDateString());
  date.setHours(20);
  return date;
}