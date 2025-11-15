let allData = [];
let currentCarouselIndex = 0;
let totalCarouselImages = 0;

// טעינת הנתונים
async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    allData = data.tzadikim;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
      const tzadik = allData.find((t) => t.id === parseInt(id));
      if (tzadik) {
        renderTzadik(tzadik);
      } else {
        showNotFound();
      }
    } else {
      showNotFound();
    }
  } catch (error) {
    console.error("Error loading data:", error);
    showNotFound();
  }
}

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

// פונקציה לבדיקה אם תמונה קיימת
async function imageExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

// פונקציה לטעינת תמונות מתיקיית הצדיק
async function loadTzadikImages(tzadikId) {
  const images = [];
  let imageNumber = 1;
  const maxImagesToCheck = 20;

  while (imageNumber <= maxImagesToCheck) {
    const imagePath = `./images/${tzadikId}/${imageNumber}.jpg`;
    const exists = await imageExists(imagePath);

    if (exists) {
      images.push(imagePath);
      imageNumber++;
    } else {
      break;
    }
  }

  return images;
}

// פונקציות למודל תצוגה מלאה
function openImageModal(imageSrc) {
  document.getElementById("modalImage").src = imageSrc;
  document.getElementById("imageModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeImageModal() {
  document.getElementById("imageModal").classList.remove("active");
  document.body.style.overflow = "auto";
}

// סגירה בלחיצה על ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeImageModal();
  }
});

// סגירה בלחיצה על הרקע
document.getElementById("imageModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeImageModal();
  }
});

// פונקציות לקרוסלה
function scrollCarousel(direction) {
  const gallery = document.getElementById("imagesGallery");
  const itemWidth = 200 + 12;
  currentCarouselIndex += direction;

  if (currentCarouselIndex < 0) currentCarouselIndex = 0;
  if (currentCarouselIndex > totalCarouselImages - 1)
    currentCarouselIndex = totalCarouselImages - 1;

  gallery.style.transform = `translateX(${currentCarouselIndex * itemWidth}px)`;
  updateCarouselButtons();
}

function updateCarouselButtons() {
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  if (totalCarouselImages > 2) {
    prevBtn.style.display = currentCarouselIndex > 0 ? "flex" : "none";
    nextBtn.style.display =
      currentCarouselIndex < totalCarouselImages - 2 ? "flex" : "none";
  }
}

async function renderTzadik(tzadik) {
  // כותרת
  const title = getTitle(tzadik);
  const honorific = tzadik.gender === "male" ? 'זצ"ל' : 'ע"ה';
  document.getElementById(
    "tzadikTitle"
  ).textContent = `${title} ${tzadik.name} ${honorific}`;
  document.title = `${tzadik.name} - הבלוג של הצדיקים`;

  // פרטים
  const detailsHtml = [];

  if (tzadik.birthDate || tzadik.birthDateHebrew) {
    const gregorian = tzadik.birthDate
      ? new Date(tzadik.birthDate).toLocaleDateString("he-IL")
      : "";
    const hebrew = tzadik.birthDateHebrew || "";

    let dateText = "";
    if (hebrew && gregorian) {
      dateText = `${hebrew} | ${gregorian}`;
    } else if (hebrew) {
      dateText = hebrew;
    } else if (gregorian) {
      dateText = gregorian;
    }

    if (dateText) {
      detailsHtml.push(`
        <div>
          <span class="font-medium text-amber-800">תאריך לידה: </span>
          ${dateText}
        </div>
      `);
    }
  }

  if (tzadik.deathDate || tzadik.deathDateHebrew) {
    const gregorian = tzadik.deathDate
      ? new Date(tzadik.deathDate).toLocaleDateString("he-IL")
      : "";
    const hebrew = tzadik.deathDateHebrew || "";

    let dateText = "";
    if (hebrew && gregorian) {
      dateText = `${hebrew} | ${gregorian}`;
    } else if (hebrew) {
      dateText = hebrew;
    } else if (gregorian) {
      dateText = gregorian;
    }

    if (dateText) {
      detailsHtml.push(`
        <div>
          <span class="font-medium text-amber-800">תאריך פטירה: </span>
          ${dateText}
        </div>
      `);
    }
  }

  if (tzadik.country) {
    detailsHtml.push(`
      <div>
        <span class="font-medium text-amber-800">מדינה: </span>
        ${tzadik.country}
      </div>
    `);
  }

  if (tzadik.city) {
    detailsHtml.push(`
      <div>
        <span class="font-medium text-amber-800">עיר: </span>
        ${tzadik.city}
      </div>
    `);
  }

  if (tzadik.community?.name) {
    detailsHtml.push(`
      <div>
        <span class="font-medium text-amber-800">קהילה: </span>
        ${tzadik.community.name}
      </div>
    `);
  }

  document.getElementById("detailsContent").innerHTML =
    detailsHtml.length > 0
      ? detailsHtml.join("")
      : '<p class="text-slate-500 italic text-center">אין מידע זמין</p>';

  // כפתורי מיקום
  if (tzadik.location && tzadik.location.length >= 2 && tzadik.location[0]) {
    document.getElementById("locationButtons").innerHTML = `
      <a
        href="https://maps.google.com/?q=${tzadik.location[0]},${tzadik.location[1]}"
        target="_blank"
        rel="noopener noreferrer"
        class="px-3 py-2 rounded-full bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition text-sm text-center"
      >
        פתח ב-Google Maps
      </a>
      <a
        href="https://waze.com/ul?ll=${tzadik.location[0]},${tzadik.location[1]}&navigate=yes"
        target="_blank"
        rel="noopener noreferrer"
        class="px-3 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition text-sm text-center"
      >
        פתח ב-Waze
      </a>
    `;
  }

  // בדיקה אילו סקשנים יש בהם מידע
  const hasDescription =
    tzadik.descriptionPlace && tzadik.descriptionPlace.trim();
  const hasBiography =
    tzadik.biography &&
    Array.isArray(tzadik.biography) &&
    tzadik.biography.length > 0;
  const hasBooks =
    tzadik.books && Array.isArray(tzadik.books) && tzadik.books.length > 0;
  const hasArticles =
    tzadik.article &&
    Array.isArray(tzadik.article) &&
    tzadik.article.length > 0;

  // תיאור המקום
  const descriptionSection = document
    .getElementById("descriptionContent")
    .closest(".bg-white\\/90");
  if (hasDescription) {
    document.getElementById(
      "descriptionContent"
    ).innerHTML = `<p class="mb-4 last:mb-0 whitespace-pre-line">${tzadik.descriptionPlace}</p>`;
    descriptionSection.classList.remove("scale-95", "opacity-80");
  } else {
    document.getElementById("descriptionContent").innerHTML =
      '<p class="text-slate-500 italic text-center text-sm">אין מידע זמין</p>';
    descriptionSection.classList.add("scale-95", "opacity-80");
    descriptionSection.style.order = "100";
  }

  // ביוגרפיה
  const biographySection = document
    .getElementById("biographyContent")
    .closest(".bg-white\\/90");
  if (hasBiography) {
    document.getElementById("biographyContent").innerHTML = tzadik.biography
      .map((p) => `<p class="mb-4 last:mb-0">${p}</p>`)
      .join("");
    biographySection.classList.remove("scale-95", "opacity-80");
  } else {
    document.getElementById("biographyContent").innerHTML =
      '<p class="text-slate-500 italic text-center text-sm">אין מידע זמין</p>';
    biographySection.classList.add("scale-95", "opacity-80");
    biographySection.style.order = "101";
  }

  // ספרים
  const booksSection = document
    .getElementById("booksContent")
    .closest(".bg-white\\/90");
  if (hasBooks) {
    document.getElementById("booksContent").innerHTML = `
      <ul class="space-y-2">
        ${tzadik.books
          .map(
            (book) => `
          <li class="flex items-center gap-3 text-amber-900">
            <div class="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span>${book}</span>
          </li>
        `
          )
          .join("")}
      </ul>
    `;
    booksSection.classList.remove("scale-95", "opacity-80");
  } else {
    document.getElementById("booksContent").innerHTML =
      '<p class="text-slate-500 italic text-center text-sm">אין מידע זמין</p>';
    booksSection.classList.add("scale-95", "opacity-80");
    booksSection.style.order = "102";
  }

  // מאמרים
  const articlesSection = document
    .getElementById("articlesContent")
    .closest(".bg-white\\/90");
  if (hasArticles) {
    document.getElementById("articlesContent").innerHTML = `
      <ul class="space-y-2">
        ${tzadik.article
          .map(
            (article) => `
          <li class="flex items-center gap-3 text-amber-900">
            <div class="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span>${article}</span>
          </li>
        `
          )
          .join("")}
      </ul>
    `;
    articlesSection.classList.remove("scale-95", "opacity-80");
  } else {
    document.getElementById("articlesContent").innerHTML =
      '<p class="text-slate-500 italic text-center text-sm">אין מידע זמין</p>';
    articlesSection.classList.add("scale-95", "opacity-80");
    articlesSection.style.order = "103";
  }

  // תמונה ראשית
  const tzadikImages = await loadTzadikImages(tzadik.id);

  if (tzadikImages.length > 0) {
    document.getElementById("mainImageSection").classList.remove("hidden");
    document.getElementById("mainImage").src = tzadikImages[0];
    document.getElementById("mainImage").alt = tzadik.name;
  }

  // תמונות נוספות
  if (tzadikImages.length > 1) {
    const additionalImages = tzadikImages.slice(1);
    totalCarouselImages = additionalImages.length;
    currentCarouselIndex = 0;

    document.getElementById("imagesSection").classList.remove("hidden");
    document.getElementById("imagesGallery").innerHTML = additionalImages
      .map(
        (img, i) => `
        <div class="carousel-item">
          <img
            src="${img}"
            alt="תמונה ${i + 2}"
            class="rounded max-h-32 w-full object-cover border cursor-pointer hover:opacity-90 transition"
            onclick="openImageModal('${img}')"
          />
        </div>
      `
      )
      .join("");

    updateCarouselButtons();
  }
}

function showNotFound() {
  document.getElementById("tzadikTitle").textContent = "צדיק לא נמצא";
  document.querySelector(".max-w-4xl").innerHTML = `
    <div class="text-center py-12">
      <h1 class="text-3xl font-bold text-amber-900 mb-4">הצדיק לא נמצא</h1>
      <p class="text-amber-800 mb-6">מצטערים, לא מצאנו את הצדיק שחיפשת</p>
      <a href="index.html" class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-white font-semibold shadow hover:shadow-lg transition">
        חזרה לרשימה
      </a>
    </div>
  `;
}

// טעינה ראשונית
loadData();

// *** נתוני דמו לבדיקות ***
// הסר את ההערה כדי לראות דוגמה ללא טעינת JSON

// const DEMO_TZADIK = {
//   id: 999,
//   name: "יוסף חיים",
//   gender: "male",
//   community: { name: "בגדד" },
//   birthDate: "1835-09-04",
//   birthDateHebrew: "כד אלול תקצה",
//   deathDate: "1909-08-30",
//   deathDateHebrew: "א אלול תרסט",
//   country: "עיראק",
//   city: "בגדד",
//   location: [33.3152, 44.3661],
//   descriptionPlace: `הרב יוסף חיים נולד בבגדד בשנת 1835. הוא היה אחד מהפוסקים הגדולים בדורו וכתב את הספר "בן איש חי" המפורסם. הרב יוסף חיים נפטר בשנת 1909 ונקבר בבית הקברות היהודי בבגדד.`,
//   biography: [
//     `הרב יוסף חיים נולד למשפחה יהודית מסורתית בבגדד. מגיל צעיר התבלט בלימודו ובהבנתו העמוקה בתורה ובפוסקים.`,
//     `במהלך חייו, הרב יוסף חיים שימש כרב קהילה וכמורה לתלמידים רבים, שהמשיכו את דרכו והפיצו את תורתו ברחבי העולם היהודי.`,
//     `הוא נודע גם בפעילותו החברתית והרוחנית, וסייע רבות לקהילה היהודית בבגדד בתקופות קשות.`,
//   ],
//   books: ["בן איש חי", "שו'ת יוסף חיים"],
//   article: ["מאמר על חשיבות לימוד התורה", "הנהגות בחיי היום-יום"],
// };
// renderTzadik(DEMO_TZADIK);
