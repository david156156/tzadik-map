// מיקום קבוע — ירושלים
const LOC = { lat: 31.7683, lon: 35.2137 };

async function showHebrewDate() {
  const el = document.getElementById("hebrew-date");
  let now = new Date();

  // חישוב שקיעה
  const times = SunCalc.getTimes(now, LOC.lat, LOC.lon);
  const sunset = times.sunset;

  // אם עברנו שקיעה — היום ההלכתי הוא של מחר
  let target = new Date(now);
  if (now >= sunset) {
    target.setDate(target.getDate() + 1);
  }

  // יום בשבוע מ-JS
  const weekdays = [
    "יום ראשון",
    "יום שני",
    "יום שלישי",
    "יום רביעי",
    "יום חמישי",
    "יום שישי",
    "יום שבת",
  ];
  const weekday = weekdays[target.getDay()];

  // תאריך עברי מה-API
  const iso = target.toISOString().split("T")[0];
  const url = `https://www.hebcal.com/converter?cfg=json&date=${iso}&g2h=1`;
  const resp = await fetch(url);
  const data = await resp.json();

  // data.hebrew מכיל תאריך עברי כמו "כ״ו חשוון התשפ״ו"
  const fullDate = `${weekday}, ${data.hebrew}`;
  el.textContent = fullDate;

  // אם הפונקציה displayTodayTzadikim קיימת (רק בדף הראשי), קרא לה
  if (typeof displayTodayTzadikim === "function") {
    displayTodayTzadikim(fullDate);
  }
}

showHebrewDate();
