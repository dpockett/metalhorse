// Metal Horse — синхронізація каталогу з DNTrade у catalog.json
// Запуск: DNTRADE_TOKEN=xxx node sync-dntrade.mjs [шлях/до/catalog.json]
// Токен НІКОЛИ не потрапляє на сайт: скрипт віддає тільки публічні дані
// (назва, артикул, роздрібна ціна, фото, наявність, модель, категорія).

import { writeFile } from "node:fs/promises";

const API = "https://api.dntrade.com.ua";
const TOKEN = process.env.DNTRADE_TOKEN;
const OUT = process.argv[2] || "catalog.json";
const STORE_ID = "833a605c-fa32-46b6-9735-067239c68634"; // склад «Metal Horse»
if (!TOKEN) { console.error("Немає DNTRADE_TOKEN"); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function call(path, method = "POST") {
  for (let i = 0; i < 8; i++) {
    const r = await fetch(API + path, { method, headers: { ApiKey: TOKEN, "Content-Type": "application/json" }, body: method === "POST" ? "{}" : undefined });
    if (r.status === 429) { await sleep((+r.headers.get("Retry-After") || 30) * 1000 + 500); continue; }
    if (!r.ok) throw new Error(`${path} → HTTP ${r.status}`);
    return r.json();
  }
  throw new Error(`${path} → ліміт запитів`);
}
async function all(path, key) {
  const out = [];
  for (let off = 0; ; off += 100) {
    const sep = path.includes("?") ? "&" : "?";
    const d = await call(`${path}${sep}limit=100&offset=${off}`);
    const part = d[key] || [];
    out.push(...part);
    if (part.length < 100) return out;
  }
}

/* ---- Моделі: тег «марка авто» в DNTrade → гарна назва на сайті ---- */
const MODEL_FIX = {
  "CHEVROLET EQUINOX EV 2024 - 2026": { b: "Chevrolet", m: "Equinox EV", y: "2024–2026", ev: 1 },
  "CHEVROLET BLAZER EV 2024 - 2026": { b: "Chevrolet", m: "Blazer EV", y: "2024–2026", ev: 1 },
  "CHEVROLET BOLT EV 2017 - 2021": { b: "Chevrolet", m: "Bolt EV", y: "2017–2021", ev: 1 },
  "CHEVROLET BOLT EUV 2021 - 2023": { b: "Chevrolet", m: "Bolt EUV", y: "2021–2023", ev: 1 },
  "Chevrolet Volt LT 2018": { b: "Chevrolet", m: "Volt", y: "2018", ev: 0 },
  "TESLA MODEL 3 2018 - 2023": { b: "Tesla", m: "Model 3", y: "2018–2023", ev: 1 },
  "HYUNDAI IONIQ 6 2022 - 2026": { b: "Hyundai", m: "Ioniq 6", y: "2022–2026", ev: 1 },
  "HYUNDAI IONIQ 5 2024": { b: "Hyundai", m: "Ioniq 5", y: "2024", ev: 1 },
  "HYUNDAI KONA EV 2018 - 2023": { b: "Hyundai", m: "Kona EV", y: "2018–2023", ev: 1 },
  "KIA NIRO 2 2022 - 2025": { b: "Kia", m: "Niro 2", y: "2022–2025", ev: 1 },
  "GENESIS GV60 2021 - 2024": { b: "Genesis", m: "GV60", y: "2021–2024", ev: 1 },
  "GENESIS GV80 2022": { b: "Genesis", m: "GV80", y: "2022", ev: 0 },
  "POLESTAR 2 2020 - 2025": { b: "Polestar", m: "Polestar 2", y: "2020–2025", ev: 1 },
  "ACURA ZDX EV 2024 - 2025": { b: "Acura", m: "ZDX EV", y: "2024–2025", ev: 1 },
  "VINFAST VF8 ECO / PLUS 2023 - 2025": { b: "VinFast", m: "VF8", full: "VF8 Eco / Plus", y: "2023–2025", ev: 1 },
  "SUBARU LEGACY SEDAN B15 2018 - 2019": { b: "Subaru", m: "Legacy B15", y: "2018–2019", ev: 0 },
  "SUBARU LEGACY SEDAN B16 2019 - 2025": { b: "Subaru", m: "Legacy B16", y: "2019–2025", ev: 0 },
  "Volkswagen Tiguan 2021": { b: "Volkswagen", m: "Tiguan", y: "2021", ev: 0 },
  "Toyota Sienna 2020": { b: "Toyota", m: "Sienna", y: "2020", ev: 0 },
};
const cap = w => w.charAt(0) + w.slice(1).toLowerCase();
function parseModel(raw) {
  const t = raw.replace(/\s+/g, " ").trim();
  if (MODEL_FIX[t]) return MODEL_FIX[t];
  // нова модель, якої ще немає в списку: «MARKA MODEL 2020 - 2024»
  const ym = t.match(/(\d{4})(?:\s*-\s*(\d{4}))?\s*$/);
  const words = t.slice(0, ym ? ym.index : undefined).trim().split(" ");
  return { b: cap(words[0]), m: words.slice(1).map(w => /\d/.test(w) || w.length <= 3 ? w.toUpperCase() : cap(w)).join(" ") || words[0],
           y: ym ? (ym[2] ? `${ym[1]}–${ym[2]}` : ym[1]) : "", ev: /\bEV\b|EUV/i.test(t) ? 1 : 0 };
}

/* ---- Категорії DNTrade → категорії сайту ---- */
const CAT_NAME = {
  "ДЕТАЛІ КУЗОВА": "Кузов", "САЛОН ІНТЕР'ЄР": "Салон", "ЕЛЕКТРИКА": "Електрика", "ПІДВІСКА РУЛЬОВЕ": "Підвіска і рульове",
  "ТОРМОЗНА СИСТЕМА": "Гальма", "ТРУБКИ ПАТРУБКИ": "Трубки, патрубки", "СИСТЕМА  ОХОЛОДЖЕННЯ КОНДИЦІОНУВАННЯ": "Охолодження і кондиціонер",
  "КОЛЕСА": "Колеса", "ФАРИ ЛІХТАРІ": "Оптика", "БЕЗПЕКА": "Безпека", "ДВИГУН": "Двигун", "ДЗЕРКАЛО": "Дзеркала",
  "ТРАНСМІСІЯ": "Трансмісія", "АКСЕСУАРИ": "Аксесуари", "КИЛИМКИ": "Килимки",
  // дублікати з іншої гілки дерева
  "ПІДВІСКА/РУЛЬОВЕ": "Підвіска і рульове", "СИСТЕМА  ОХОЛОДЖЕННЯ/КОНДИЦІОНУВАННЯ": "Охолодження і кондиціонер",
};
const SKIP_ROOTS = new Set(["Оренда"]); // внутрішнє: матеріали, канцтовари, послуги — на сайт не йде
const SUB_NAME = { "БАМПЕРА": "Бампери", "ДВЕРІ": "Двері", "КАПОТ": "Капот", "ЗАХИСТ": "Захист", "МОЛДІНГИ": "Молдинги", "СКЛО": "Скло",
  "УЩІЛЬНЮВАЧ": "Ущільнювачі", "ПІДКРИЛОК": "Підкрилки", "КУЗОВН-ЖЕСТЬ": "Кузовне залізо", "ШИНИ": "Шини", "ДИСКИ": "Диски",
  "БОЛТИ, ГАЙКИ": "Болти, гайки", "АКУМУЛЯТОРИ": "Акумулятори", "БЛОКИ": "Блоки керування", "ІНВЕРТОР": "Інвертори", "ДАТЧИКИ": "Датчики",
  "ПРОВОДКА": "Проводка", "ЗАРЯДНІ ПРИСТРОЇ/перехідники": "Зарядні пристрої", "СТІЙКА": "Стійки", "ВАЖІЛЬ РИЧАГ": "Важелі",
  "ПІДРАМНИК": "Підрамники", "ЦАПФА": "Цапфи" };
const subName = t => SUB_NAME[t] || cap(t.split("/")[0].trim());

const CDN = "https://cdn.dntrade.com.ua/";
const short = u => { const r = u.startsWith(CDN) ? u.slice(CDN.length) : u; try { return decodeURI(r); } catch { return r; } }; // сайт додає CDN назад
const money = (v, cur) => { const n = Math.round(parseFloat(v)); return n > 0 ? n.toLocaleString("uk-UA").replace(/ /g, " ") + (cur === "грн." ? " ₴" : " $") : ""; };

async function main() {
  const t0 = Date.now();
  const categories = (await call("/products/categories", "GET")).categories || [];
  const byId = new Map(categories.map(c => [c.category_id.toLowerCase(), c]));
  const rootOf = c => { let x = c; for (let i = 0; i < 6 && x.parent; i++) x = byId.get(x.parent.id.toLowerCase()) || x; return x; };

  // 1) усі товари
  const products = await all("/products/list", "products");
  // 2) категорія кожного товару (у загальному списку DNTrade її не віддає)
  const catOf = new Map();
  for (const c of categories) {
    if (c.store_id && c.store_id !== STORE_ID) continue;
    const items = await all(`/products/list?category_id=${c.category_id}`, "products");
    for (const p of items) catOf.set(p.product_id, c);
  }

  const models = new Map(), parts = [];
  for (const p of products) {
    const c = catOf.get(p.product_id);
    if (!c) continue;                                   // без категорії (наприклад «Доставка»)
    const root = rootOf(c);
    if (SKIP_ROOTS.has(root.title)) continue;
    const qty = (p.balance || 0) - (p.booked || 0);
    if (qty <= 0) continue;                             // продано / немає на складі — не показуємо
    const cat = CAT_NAME[c.title] || CAT_NAME[root.title] || "Інше";
    let l2 = c; for (let i = 0; i < 6 && l2.level > 2 && l2.parent; i++) l2 = byId.get(l2.parent.id.toLowerCase()) || l2;
    const sub = l2.level === 2 && !CAT_NAME[l2.title] && root.title !== "-- БЕЗ КАТЕГОРІЇ --" ? subName(l2.title) : "";
    const tag = (p.tags || []).find(t => t.title === "марка авто");
    const rawModel = tag && tag.items && tag.items[0] && tag.items[0].title;
    let mk = "";
    if (rawModel) {
      const m = parseModel(rawModel); mk = m.m;
      if (!models.has(mk)) models.set(mk, { ...m, n: 0 });
      models.get(mk).n++;
    }
    const mo = mk && models.get(mk);
    const tire = (p.tags || []).find(t => t.title === "марка шин");
    const imgs = [p.image_path, ...(p.images || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10);
    parts.push({
      id: "d" + p.code,                                  // код товару в DNTrade
      n: p.title.replace(/\s+/g, " ").trim(),
      m: mk,
      fit: mo ? `${(mo.full || mo.m).startsWith(mo.b) ? "" : mo.b + " "}${mo.full || mo.m}${mo.y ? " " + mo.y : ""}` : (tire && tire.items[0] ? tire.items[0].title : ""),
      c: cat, sc: sub,
      pn: p.sku && p.sku.trim() !== String(p.code) ? p.sku.trim() : "",
      code: p.code,
      p: money(p.price, p.currency),
      q: qty,
      img: imgs[0] ? short(imgs[0]) : "", imgs: imgs.slice(1).map(short),
    });
  }
  const ORDER = Object.values(CAT_NAME).filter((v, i, a) => a.indexOf(v) === i);
  const catCount = {}; parts.forEach(p => catCount[p.c] = (catCount[p.c] || 0) + 1);
  const cats = [...ORDER, "Інше"].filter(c => catCount[c]);
  const modelList = [...models.values()].sort((a, b) => b.n - a.n);
  const subs = {}; parts.forEach(p => { if (p.sc) { (subs[p.c] = subs[p.c] || {})[p.sc] = (subs[p.c][p.sc] || 0) + 1; } });
  const subcats = Object.fromEntries(Object.entries(subs).map(([k, v]) => [k, Object.keys(v).sort((a, b) => v[b] - v[a])]));
  let rate = null;
  try {
    const r = await fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json");
    const j = await r.json();
    if (j && j[0] && j[0].rate) rate = { v: j[0].rate, d: j[0].exchangedate };
  } catch (e) { console.warn("NBU rate:", e.message); }
  const data = { cdn: CDN, updated: new Date().toISOString(), rate, total: parts.length, models: modelList, cats, subcats, parts };
  const json = JSON.stringify(data);
  await writeFile(OUT, json);
  // catalog.js — той самий каталог, але працює і коли сайт відкрито просто з диска (file://)
  await writeFile(OUT.replace(/\.json$/, "") + ".js", "window.MH_CATALOG=" + json + ";");
  console.log(`Готово: ${parts.length} деталей, ${modelList.length} моделей, ${cats.length} категорій за ${Math.round((Date.now() - t0) / 1000)} с → ${OUT}`);
}
main().catch(e => { console.error(e); process.exit(1); });
