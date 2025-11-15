let tzadikimData = [];
let filteredData = [];
let currentHebrewDate = "";

// רשימת חודשים עבריים לפי סדר
const HEBREW_MONTHS = [
  "תשרי",
  "חשוון",
  "כסלו",
  "טבת",
  "שבט",
  "אדר",
  "אדר א",
  "אדר ב",
  "ניסן",
  "אייר",
  "סיוון",
  "תמוז",
  "אב",
  "אלול",
];

// טעינת הנתונים מקובץ JSON
async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    tzadikimData = data.tzadikim;
    populateFilters();
    renderTzadikim(tzadikimData);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

// חילוץ חודש עברי מתאריך עברי מלא
function extractHebrewMonth(hebrewDate) {
  if (!hebrewDate) return null;
  const parts = hebrewDate.split(" ");
  if (parts.length === 3) {
    return parts[1];
  } else if (parts.length === 4) {
    return parts[1] + " " + parts[2];
  }
  return null;
}

// מילוי הפילטרים
function populateFilters() {
  const cities = [
    ...new Set(tzadikimData.map((t) => t.city).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "he"));
  const communities = [
    ...new Set(tzadikimData.map((t) => t.community?.name).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "he"));

  const cityFilter = document.getElementById("cityFilter");
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.appendChild(option);
  });

  const communityFilter = document.getElementById("communityFilter");
  communities.forEach((community) => {
    const option = document.createElement("option");
    option.value = community;
    option.textContent = community;
    communityFilter.appendChild(option);
  });

  const monthFilter = document.getElementById("monthFilter");
  HEBREW_MONTHS.forEach((month) => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthFilter.appendChild(option);
  });
}

// קבלת כותרת לפי מין וקהילה
function getTitle(tzadik) {
  if (tzadik.gender === "female" && tzadik.community?.name) {
    const comm = tzadik.community.name.trim();
    return comm.includes("תימן") ? "מרת" : "הרבנית";
  }
  if (tzadik.gender === "male" && tzadik.community?.name) {
    const comm = tzadik.community.name.trim();
    return comm.includes("תימן") ? "מורי" : "רבי";
  }
  return "";
}

// קיבוץ לפי אות ראשונה
function groupByFirstLetter(data) {
  const grouped = {};
  data.forEach((tzadik) => {
    const letter = tzadik.name?.charAt(0) || "א";
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(tzadik);
  });
  return grouped;
}

// רינדור הצדיקים
function renderTzadikim(data) {
  const container = document.getElementById("tzadikimList");
  container.innerHTML = "";

  const grouped = groupByFirstLetter(data);
  const sortedLetters = Object.keys(grouped).sort();

  sortedLetters.forEach((letter) => {
    const section = document.createElement("div");
    section.className = "mb-2";

    const header = document.createElement("div");
    header.className = "flex items-center gap-4 mb-2";
    header.innerHTML = `
      <div class="w-8 h-8 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl flex items-center justify-center text-l font-bold shadow-lg">
        ${letter}
      </div>
      <div class="h-px bg-gradient-to-l from-amber-200 to-transparent flex-1"></div>
    `;
    section.appendChild(header);

    const grid = document.createElement("div");
    grid.className =
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-1 gap-y-1";

    grouped[letter].forEach((tzadik) => {
      const card = document.createElement("a");
      card.href = `tzadik.html?id=${tzadik.id}`;
      card.className =
        "group cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-300 rounded-xl block";

      const title = getTitle(tzadik);
      const honorific = tzadik.gender === "male" ? 'זצ"ל' : 'ע"ה';
      const locationText = tzadik.city || "";

      card.innerHTML = `
        <div class="py-2 px-4 flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-200 transition-all duration-300 flex-shrink-0">
            <svg class="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 19.5V8.5a2 2 0 012-2h12a2 2 0 012 2v11M9 12h6"/>
            </svg>
          </div>
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <h3 class="font-bold text-amber-900 text-base group-hover:text-amber-700 transition-colors whitespace-nowrap">
              ${title} ${tzadik.name} ${honorific}
            </h3>
            ${
              locationText
                ? `
              <span class="text-amber-600 mx-1">|</span>
              <div class="flex items-center gap-1.5 text-amber-800 text-sm">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span class="truncate">${locationText}</span>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// פילטור
function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const cityFilter = document.getElementById("cityFilter").value;
  const communityFilter = document.getElementById("communityFilter").value;
  const monthFilter = document.getElementById("monthFilter").value;

  const filtered = tzadikimData.filter((tzadik) => {
    const matchesSearch =
      !searchTerm || tzadik.name?.toLowerCase().includes(searchTerm);
    const matchesCity = !cityFilter || tzadik.city === cityFilter;
    const matchesCommunity =
      !communityFilter || tzadik.community?.name === communityFilter;

    const matchesMonth =
      !monthFilter ||
      extractHebrewMonth(tzadik.deathDateHebrew) === monthFilter ||
      extractHebrewMonth(tzadik.deathDateHebrew) === `ב${monthFilter}`;

    return matchesSearch && matchesCity && matchesCommunity && matchesMonth;
  });

  renderTzadikim(filtered);
}

// פונקציה להסרת ניקוד מטקסט עברי
function removeNikud(text) {
  if (!text) return "";
  return text.replace(/[\u0591-\u05C7]/g, "");
}

// פונקציה לנרמול טקסט
function normalizeHebrewText(text) {
  if (!text) return "";
  return removeNikud(text).replace(/[״"]/g, '"').replace(/[׳']/g, "'").trim();
}

// פונקציה לחילוץ יום וחודש מתאריך עברי
function extractDayAndMonth(hebrewDate) {
  if (!hebrewDate) return null;
  const parts = hebrewDate.split(" ");

  if (parts.length >= 4) {
    const day = normalizeHebrewText(parts[2].replace(/,/g, ""));
    let month = normalizeHebrewText(parts[3]);

    // הסרת ה-ב' מתחילת שם החודש אם קיים
    if (month.startsWith("ב")) {
      month = month.substring(1);
    }

    return { day, month };
  }
  return null;
}

// פונקציה למצוא צדיקים שנפטרו בתאריך זה
function findTzadikimByDate(dayMonth) {
  if (!dayMonth) return [];

  return tzadikimData.filter((tzadik) => {
    if (!tzadik.deathDateHebrew) return false;

    const parts = tzadik.deathDateHebrew.split(" ");

    if (parts.length >= 2) {
      const tzadikDay = normalizeHebrewText(parts[0]);
      const tzadikMonth = normalizeHebrewText(parts[1]);

      return tzadikDay === dayMonth.day && tzadikMonth === dayMonth.month;
    }

    return false;
  });
}

// הצגת צדיקים של היום
function displayTodayTzadikim(hebrewDateStr) {
  currentHebrewDate = hebrewDateStr;
  const dayMonth = extractDayAndMonth(hebrewDateStr);

  if (!dayMonth) return;

  const todayTzadikim = findTzadikimByDate(dayMonth);
  if (todayTzadikim.length > 0) {
    const container = document.getElementById("todayTzadikim");
    const titleElement = document.getElementById("todayHebrewDateTitle");
    const listElement = document.getElementById("todayTzadikimList");

    titleElement.textContent = `צדיקים שנפטרו ב-${dayMonth.day} ${dayMonth.month}`;

    listElement.innerHTML = todayTzadikim
      .map((tzadik) => {
        const title = getTitle(tzadik);
        const honorific = tzadik.gender === "male" ? 'זצ"ל' : 'ע"ה';
        const locationText = tzadik.city || "";

        return `
          <a href="tzadik.html?id=${tzadik.id}" 
             class="group cursor-pointer bg-white/90 backdrop-blur-sm hover:bg-white hover:shadow-xl transition-all duration-300 border border-amber-100 hover:border-amber-300 rounded-xl block p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center group-hover:from-amber-200 group-hover:to-orange-200 transition-all duration-300 flex-shrink-0">
                <svg class="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 19.5V8.5a2 2 0 012-2h12a2 2 0 012 2v11M9 12h6"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-amber-900 text-base group-hover:text-amber-700 transition-colors">
                  ${title} ${tzadik.name} ${honorific}
                </h3>
                ${
                  locationText
                    ? `
                  <div class="flex items-center gap-1.5 text-amber-800 text-sm mt-1">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                      <circle cx="12" cy="9" r="2.5"/>
                    </svg>
                    <span class="truncate">${locationText}</span>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          </a>
        `;
      })
      .join("");

    container.classList.remove("hidden");
  }
}

// Event Listeners
document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("cityFilter").addEventListener("change", applyFilters);
document
  .getElementById("communityFilter")
  .addEventListener("change", applyFilters);
document.getElementById("monthFilter").addEventListener("change", applyFilters);

document.getElementById("toggleAdvanced").addEventListener("click", () => {
  const advancedSearch = document.getElementById("advancedSearch");
  const toggleBtn = document.getElementById("toggleAdvanced");

  if (advancedSearch.classList.contains("hidden")) {
    advancedSearch.classList.remove("hidden");
    advancedSearch.classList.add("flex");
    toggleBtn.textContent = "הסתר חיפוש מורחב";
  } else {
    advancedSearch.classList.add("hidden");
    advancedSearch.classList.remove("flex");
    toggleBtn.textContent = "הרחב חיפוש";
  }
});

document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("cityFilter").value = "";
  document.getElementById("communityFilter").value = "";
  document.getElementById("monthFilter").value = "";
  applyFilters();
});

// טעינה ראשונית
loadData();

// *** רשימה לדוגמה לבדיקות ***
// הסר את ההערה כדי לראות דוגמה ללא טעינת JSON

// tzadikimData = [
//   {
//     id: 1,
//     name: "יוסף חיים",
//     gender: "male",
//     community: { id: 4, name: "עיראק" },
//     city: "בגדד",
//     country: "עיראק",
//     birthDate: "1835-09-04",
//     birthDateHebrew: "כד אלול תקצה",
//     deathDate: "1909-08-30",
//     deathDateHebrew: "א אלול תרסט",
//   },
//   {
//     id: 2,
//     name: "אהרון בוזגלו",
//     gender: "male",
//     community: { id: 2, name: "מרוקו" },
//     city: "אשקלון",
//     country: "ישראל",
//     birthDate: null,
//     birthDateHebrew: null,
//     deathDate: "1956-10-15",
//     deathDateHebrew: "י אלול תשטז",
//   },
//   {
//     id: 3,
//     name: "מרים שובלי",
//     gender: "female",
//     community: { id: 3, name: "תימן" },
//     city: "פתח תקווה",
//     country: "ישראל",
//     birthDate: null,
//     birthDateHebrew: null,
//     deathDate: "1996-07-03",
//     deathDateHebrew: "טז תמוז תשנו",
//   },
//   {
//     id: 4,
//     name: "יחיא עואד",
//     gender: "male",
//     community: { id: 3, name: "תימן" },
//     city: "רמת השרון",
//     country: "ישראל",
//     birthDate: null,
//     birthDateHebrew: null,
//     deathDate: "1981-10-22",
//     deathDateHebrew: "כג תשרי תשמב",
//   },
//   {
//     id: 5,
//     name: "יעקב אבוחצירא",
//     gender: "male",
//     community: { id: 2, name: "מרוקו" },
//     city: "נתיבות",
//     country: "ישראל",
//     birthDate: "1808-01-01",
//     birthDateHebrew: "כא טבת תקסח",
//     deathDate: "1880-12-20",
//     deathDateHebrew: "ח טבת תרמא",
//   },
//   {
//     id: 6,
//     name: "רבי שמעון",
//     gender: "male",
//     city: "מירון",
//     country: "ישראל",
//     deathDateHebrew: 'כ"ה חשון תשפה',
//   },
//   {
//     id: 7,
//     name: "רבי חיים",
//     gender: "male",
//     city: "ירושלים",
//     country: "ישראל",
//     deathDateHebrew: 'כ"ה חשון תשנו',
// ];

// זה גם חלק מהדמו
// populateFilters();
// renderTzadikim(tzadikimData);
