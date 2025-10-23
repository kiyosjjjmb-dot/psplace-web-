// ===== Scroll halus ke form =====
document.getElementById("pesanBtn").addEventListener("click", () => {
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
});

// ===== Efek fade-in saat scroll =====
const fadeElements = document.querySelectorAll(".fade-in");
function fadeInOnScroll() {
  const triggerBottom = window.innerHeight * 0.85;
  fadeElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < triggerBottom) el.classList.add("visible");
  });
}
window.addEventListener("scroll", fadeInOnScroll);
window.addEventListener("load", fadeInOnScroll);

// ===== Element Referensi =====
const consoleSelect = document.getElementById("console");
const roomSelect = document.getElementById("room");
const submitBtn = document.getElementById("submitBtn");
const dateInput = document.getElementById("date");
const startInput = document.getElementById("start");
const durationInput = document.getElementById("duration");
const nameInput = document.getElementById("name");
const statusDiv = document.getElementById("availability");

// =================================================
// ✅ PILIHAN ROOM DINAMIS
// =================================================
consoleSelect.addEventListener("change", function () {
  const consoleType = this.value;
  roomSelect.innerHTML = '<option value="">Pilih Room</option>';

  if (consoleType && roomsByConsole[consoleType]) {
    roomsByConsole[consoleType].forEach((category) => {
      const optGroup = document.createElement("optgroup");
      optGroup.label = category.group;
      category.list.forEach((room) => {
        const option = document.createElement("option");
        option.value = room;
        option.textContent = room;
        optGroup.appendChild(option);
      });
      roomSelect.appendChild(optGroup);
    });
  }

  submitBtn.disabled = true;
});

// =================================================
// ✅ CEK KETERSEDIAAN ROOM (dengan durasi & waktu terkunci)
// =================================================
[dateInput, startInput, durationInput, roomSelect, consoleSelect, nameInput].forEach((el) => {
  el.addEventListener("input", checkAvailability);
  el.addEventListener("change", checkAvailability);
});

function normalizeTime(value) {
  if (!value) return "";
  return value.split(":").slice(0, 2).join(":");
}

function getRoomType(roomName) {
  if (roomName.includes("Reguler")) return "Reguler";
  if (roomName.includes("Smoking")) return "Smoking";
  if (roomName.includes("VVIP")) return "VVIP";
  if (roomName.includes("VIP")) return "VIP";
  return "";
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function checkAvailability() {
  const nameVal = nameInput.value.trim();
  const dateVal = dateInput.value;
  const startVal = normalizeTime(startInput.value);
  const roomVal = roomSelect.value;
  const consoleVal = consoleSelect.value;
  const durationVal = Number(durationInput.value);

  if (!nameVal || !dateVal || !startVal || !roomVal || !consoleVal || !durationVal) {
    statusDiv.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.classList.remove("active");
    submitBtn.removeAttribute("data-wa");
    return;
  }

  const roomType = getRoomType(roomVal);
  const rate = priceList[roomType]?.[consoleVal] || 0;
  const totalHarga = rate * durationVal;

  statusDiv.style.display = "block";
  statusDiv.innerHTML = `<span class="spinner"></span>Memeriksa ketersediaan...`;
  statusDiv.className = "availability loading";
  submitBtn.disabled = true;
  submitBtn.classList.remove("active");
  submitBtn.removeAttribute("data-wa");

  setTimeout(() => {
    const startTime = toMinutes(startVal);
    const endTime = startTime + durationVal * 60;

    const isOverlap = bookedData.some((b) => {
      if (b.date !== dateVal || b.room !== roomVal) return false;
      const bStart = toMinutes(b.start);
      const bEnd = bStart + b.duration * 60;
      return startTime < bEnd && endTime > bStart; // cek bentrok
    });

    if (isOverlap) {
      statusDiv.textContent = "❌ Maaf, room sudah dibooking di jam tersebut.";
      statusDiv.className = "availability unavailable";
      submitBtn.disabled = true;
      submitBtn.classList.remove("active");
      submitBtn.removeAttribute("data-wa");
    } else {
      const hargaFormat = totalHarga.toLocaleString("id-ID");
      const message = encodeURIComponent(
        `Halo, saya ${nameVal} ingin memesan room:\n\n🎮 Konsol: ${consoleVal}\n🏠 Room: ${roomVal}\n📅 Tanggal: ${dateVal}\n🕒 Jam mulai: ${startVal}\n⏱ Durasi: ${durationVal} jam\n💰 Total: Rp${hargaFormat}`
      );
      const waLink = `https://wa.me/${waNumber}?text=${message}`;

      statusDiv.innerHTML = `
        ✅ Room tersedia!<br>
        💰 Total harga: <b>Rp${hargaFormat}</b>
      `;
      statusDiv.className = "availability available";
      submitBtn.disabled = false;
      submitBtn.classList.add("active");
      submitBtn.setAttribute("data-wa", waLink);
    }
  }, 800);
}

// =================================================
// ✅ SUBMIT FORM — LANGSUNG KIRIM KE WA
// =================================================
document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;

  const waLink = submitBtn.getAttribute("data-wa");
  if (waLink) window.open(waLink, "_blank");

  e.target.reset();
  statusDiv.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.classList.remove("active");
  submitBtn.removeAttribute("data-wa");
});

// =================================================
// ✅ SLIDER ROOM
// =================================================
const slides = document.querySelector(".slides");
const slideItems = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let index = 0;
function showSlide(i) {
  if (i < 0) index = slideItems.length - 1;
  else if (i >= slideItems.length) index = 0;
  slides.style.transform = `translateX(-${index * 100}%)`;
}

if (prevBtn && nextBtn) {
  prevBtn.addEventListener("click", () => {
    index--;
    showSlide(index);
  });
  nextBtn.addEventListener("click", () => {
    index++;
    showSlide(index);
  });
  setInterval(() => {
    index++;
    showSlide(index);
  }, 5000);
}
