#!/usr/bin/env node
// One-time migration: Kirby flat-file content -> Hugo content bundles.
//
// Reads the original Kirby tree (./content, preserved at the import commit) and
// writes a Hugo `content/` tree (to ./content_hugo) plus shared static images
// (to ./static). Run from the repo root, then swap content_hugo -> content.
//
//   node scripts/migrate-from-kirby.mjs
//
// To re-run after the swap: `git checkout <import-commit> -- content` first.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "content");
const OUT = path.join(ROOT, "content_hugo");
const STATIC = path.join(ROOT, "static");

const IMG_RE = /\.(jpe?g|png|gif|webp)$/i;
const AUTHORS = {
  "mickey@deags.com": "Mickey Deagle",
  "mickey@isolary.com": "Mickey Deagle",
  "mickey+steve@deags.com": "Mickey & Steve Deagle",
};

const log = [];
const note = (m) => log.push(m);

// ── Kirby .txt parser ────────────────────────────────────────────────
function parseKirby(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const fields = {};
  for (const block of raw.split(/\n----\n/)) {
    const m = block.match(/^\s*([A-Za-z][\w-]*):\s?([\s\S]*)$/);
    if (m) fields[m[1].toLowerCase()] = m[2].trim();
  }
  return fields;
}

// ── KirbyText -> Markdown/Hugo shortcodes ────────────────────────────
function convertBody(s) {
  if (!s) return "";
  // (link: url text: ... [target: ...])
  s = s.replace(
    /\(link:\s*(\S+)\s+text:\s*(.+?)(?:\s+target:\s*(\S+))?\s*\)/g,
    (_, url, text, target) =>
      target
        ? `<a href="${url}" target="${target}" rel="noopener">${text.trim()}</a>`
        : `[${text.trim()}](${url})`
  );
  // (image: url [class: ...])
  s = s.replace(
    /\(image:\s*(\S+)(?:\s+class:\s*(\S+))?\s*\)/g,
    (_, src, cls) =>
      `{{< image src="${src}"${cls ? ` class="${cls}"` : ""} >}}`
  );
  // {{ gallery }} placeholder
  s = s.replace(/\{\{\s*gallery\s*\}\}/g, "{{< gallery >}}");
  return s.trim();
}

// ── YAML front matter (JSON-encode scalars so quoting is always safe) ─
function fm(obj) {
  const lines = ["---"];
  const enc = (v) => JSON.stringify(v);
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    if (k === "resources") {
      lines.push("resources:");
      for (const r of v) {
        lines.push(`  - src: ${enc(r.src)}`);
        if (r.params) {
          lines.push("    params:");
          for (const [pk, pv] of Object.entries(r.params))
            lines.push(`      ${pk}: ${enc(pv)}`);
        }
      }
    } else if (Array.isArray(v)) {
      if (!v.length) continue;
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${enc(item)}`);
    } else {
      lines.push(`${k}: ${enc(v)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function write(file, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
}

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// list image files in a Kirby folder, honoring optional per-image `Sort`
function galleryImages(dir) {
  if (!fs.existsSync(dir)) return [];
  const imgs = fs
    .readdirSync(dir)
    .filter((f) => IMG_RE.test(f))
    .map((f) => {
      const side = path.join(dir, f + ".txt");
      let alt = "",
        sort = Infinity;
      if (fs.existsSync(side)) {
        const meta = parseKirby(side);
        alt = (meta.alt || meta.caption || "").trim();
        if (meta.sort && !isNaN(+meta.sort)) sort = +meta.sort;
      }
      return { file: f, alt, sort };
    });
  imgs.sort((a, b) => a.sort - b.sort || a.file.localeCompare(b.file));
  return imgs;
}

function resourcesFor(imgs) {
  const withAlt = imgs.filter((i) => i.alt);
  return withAlt.length
    ? withAlt.map((i) => ({ src: i.file, params: { alt: i.alt } }))
    : undefined;
}

function authorName(field) {
  if (!field) return undefined;
  const email = field.replace(/^-\s*/, "").trim().toLowerCase();
  return AUTHORS[email] || undefined;
}

// strip a leading "photography/" + numeric folder prefixes from a gallery ref
const galleryDir = (ref) =>
  path.join(SRC, "3_photography", ref.replace(/^-?\s*photography\//, "").trim());

// ── Tours + notes ────────────────────────────────────────────────────
function migrateTour(srcName, slug, weight) {
  const tourDir = path.join(SRC, srcName);
  const tour = parseKirby(path.join(tourDir, "tour.txt"));
  write(
    path.join(OUT, slug, "_index.md"),
    fm({
      title: tour.title,
      type: "tour",
      weight,
      date: tour.date || undefined,
    }) +
      "\n\n" +
      convertBody(tour.text) +
      "\n"
  );

  let notes = 0;
  for (const entry of fs.readdirSync(tourDir)) {
    const noteFile = path.join(tourDir, entry, "note.txt");
    if (!fs.existsSync(noteFile)) continue;
    const n = parseKirby(noteFile);
    const m = entry.match(/^(\d{8})_(.+)$/); // 20040617_rickreall
    if (!m) {
      note(`  ! skip note (bad folder name): ${entry}`);
      continue;
    }
    const [, ymd, noteSlug] = m;
    const bundle = path.join(OUT, slug, noteSlug);

    // fold the referenced gallery's images into the note bundle
    let imgs = [];
    if (n.gallery) {
      const gdir = galleryDir(n.gallery);
      imgs = galleryImages(gdir);
      for (const im of imgs) copy(path.join(gdir, im.file), path.join(bundle, im.file));
      if (!imgs.length) note(`  ! gallery empty/missing for ${entry}: ${n.gallery}`);
    }

    const tags = (n.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    write(
      path.join(bundle, "index.md"),
      fm({
        title: n.title,
        type: "note",
        date: n.date,
        weight: +ymd,
        author: authorName(n.author),
        shortname: n.shortname || n.title,
        tags,
        resources: resourcesFor(imgs),
      }) +
        "\n\n" +
        convertBody(n.text) +
        "\n"
    );
    notes++;
  }
  note(`tour ${slug}: ${notes} notes`);
}

// ── Photography: listed albums (numbered) ────────────────────────────
function migratePhotography() {
  const pDir = path.join(SRC, "3_photography");
  const photo = parseKirby(path.join(pDir, "photography.txt"));
  write(
    path.join(OUT, "photography", "_index.md"),
    fm({ title: photo.title, type: "photography" }) + "\n"
  );

  let albums = 0;
  for (const entry of fs.readdirSync(pDir)) {
    const m = entry.match(/^(\d+)_(.+)$/); // 10_florida  (listed only)
    const albumFile = path.join(pDir, entry, "album.txt");
    if (!m || !fs.existsSync(albumFile)) continue;
    const [, num, slug] = m;
    const a = parseKirby(albumFile);
    const bundle = path.join(OUT, "photography", slug);

    const imgs = galleryImages(path.join(pDir, entry));
    for (const im of imgs)
      copy(path.join(pDir, entry, im.file), path.join(bundle, im.file));

    // cover: either a bare local filename or a "photography/covers/x.jpg" ref
    let cover = (a.cover || "").replace(/^-\s*/, "").trim();
    if (cover.startsWith("photography/")) cover = "/" + cover; // -> static URL
    else if (cover) cover = cover; // local resource filename

    const tags = (a.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    write(
      path.join(bundle, "index.md"),
      fm({
        title: a.title,
        type: "album",
        weight: +num,
        shortname: a.shortname || a.title,
        headline: a.headline || undefined,
        cover: cover || undefined,
        tags,
        resources: resourcesFor(imgs),
      }) +
        "\n\n" +
        convertBody(a.description) +
        "\n"
    );
    albums++;
  }
  note(`photography: ${albums} listed albums`);
}

// ── Shared static images (covers + maps), referenced by absolute URL ──
function copyStaticImages() {
  for (const sub of ["covers", "maps"]) {
    const dir = path.join(SRC, "3_photography", sub);
    if (!fs.existsSync(dir)) continue;
    let n = 0;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".txt") || f.startsWith(".")) continue;
      copy(path.join(dir, f), path.join(STATIC, "photography", sub, f));
      n++;
    }
    note(`static photography/${sub}: ${n} files`);
  }
  // favicons, manifest, logo -> keep their /assets/images/ URLs
  const aimg = path.join(ROOT, "assets", "images");
  if (fs.existsSync(aimg)) {
    let n = 0;
    for (const f of fs.readdirSync(aimg)) {
      if (f.startsWith(".") || /TransAm-Map\.svg/i.test(f)) continue;
      copy(path.join(aimg, f), path.join(STATIC, "assets", "images", f));
      n++;
    }
    note(`static assets/images: ${n} files`);
  }
}

// ── Single pages: home + about ───────────────────────────────────────
function migrateSingles() {
  const home = parseKirby(path.join(SRC, "home", "home.txt"));
  write(
    path.join(OUT, "_index.md"),
    fm({ title: home.title, type: "home" }) +
      "\n\n" +
      convertBody(home.text) +
      "\n"
  );

  const about = parseKirby(path.join(SRC, "about", "default.txt"));
  write(
    path.join(OUT, "about.md"),
    fm({ title: about.title, type: "page" }) +
      "\n\n" +
      convertBody(about.text) +
      "\n"
  );
  note("singles: home + about");
}

// ── Run ──────────────────────────────────────────────────────────────
fs.rmSync(OUT, { recursive: true, force: true });
migrateTour("1_transamerica", "transamerica", 1);
migrateTour("2_southern-tier", "southern-tier", 2);
migratePhotography();
copyStaticImages();
migrateSingles();

console.log(log.join("\n"));
console.log("\nDone. Review ./content_hugo, then swap it in for ./content.");
