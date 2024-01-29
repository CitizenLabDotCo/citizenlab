export function roundToNearestMultipleOfFive(date: Date): Date {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 5) * 5;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    roundedMinutes
  );
}

export function calculateRoundedEndDate(startDate: Date, minutes = 30): Date {
  const endDate = new Date(startDate);
  endDate.setMinutes(startDate.getMinutes() + minutes);
  return endDate;
}
