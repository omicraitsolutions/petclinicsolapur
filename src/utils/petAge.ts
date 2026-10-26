// Calculates a display age (e.g. "3 Years", "8 Months", "2 Weeks") from a
// date of birth, for the Register/Edit Pet form's auto-calculated Age field.

export function calculateAgeFromDob(dob: string): string {
  if (!dob) return '';

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return '';

  const today = new Date();
  if (birthDate > today) return '';

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years >= 1) {
    return years === 1 ? '1 Year' : `${years} Years`;
  }
  if (months >= 1) {
    return months === 1 ? '1 Month' : `${months} Months`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks >= 1) {
    return weeks === 1 ? '1 Week' : `${weeks} Weeks`;
  }
  return days === 1 ? '1 Day' : `${Math.max(days, 0)} Days`;
}
