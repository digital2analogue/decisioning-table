import puppeteer from 'puppeteer';

const OUT = 'C:/Users/heath/Documents/Github/portfolio-vercel/.claude/worktrees/vigilant-wing-e42fa9/public/projects/images';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

// ── 1. decisioning-table-rules.png ────────────────────────────────────────
await page.goto('https://decisioning-table.vercel.app/?demo=1', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}/decisioning-table-rules.png` });
console.log('✓ decisioning-table-rules.png');

// ── 2. c1-decision-coded-prototype.png (replaces GIF) ─────────────────────
// Open the condition operator dropdown for visual interest
const opDropdown = await page.$('[class*="condition"] select, select[class*="operator"]');
if (opDropdown) await opDropdown.click();
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/c1-decision-coded-prototype.png` });
console.log('✓ c1-decision-coded-prototype.png');

// ── 3 & 4. onboarding — use tall viewport so all steps render in DOM ───────
await page.setViewport({ width: 1440, height: 2400, deviceScaleFactor: 1 });
await page.goto('https://decisioning-table.vercel.app/?onboarding=1', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1000));
await page.evaluate(() => {
  const els = document.querySelectorAll('[class*="outcome"], [class*="card"], label, div');
  for (const el of els) {
    if (el.children.length === 0 && el.textContent.trim() === 'Decline') { el.closest('div').click(); break; }
  }
});
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/decisioning-table-onboarding-step1.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });
console.log('✓ decisioning-table-onboarding-step1.png');

// ── 4. decisioning-table-onboarding-step3.png ─────────────────────────────
// Click AnnualIncome to activate preview panel (it's rendered off-screen below)
await page.evaluate(() => {
  const rows = document.querySelectorAll('.ob-element-row');
  for (const row of rows) {
    if (row.textContent.includes('AnnualIncome')) { row.click(); break; }
  }
});
await new Promise(r => setTimeout(r, 600));
// Find the Y offset of the step 3 section for clipping
const step3Top = await page.evaluate(() => {
  const h2s = document.querySelectorAll('h2');
  for (const h2 of h2s) {
    if (h2.textContent.includes('Create your first rule')) {
      return h2.getBoundingClientRect().top + window.pageYOffset - 60;
    }
  }
  return null;
});
console.log('step3Top:', step3Top);
const clipY = (step3Top !== null && step3Top > 0) ? step3Top : 950;
await page.screenshot({
  path: `${OUT}/decisioning-table-onboarding-step3.png`,
  clip: { x: 0, y: clipY, width: 1440, height: 900 }
});
console.log('✓ decisioning-table-onboarding-step3.png');

// ── 5. decisioning-table-outcome-toggles.png ──────────────────────────────
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto('https://decisioning-table.vercel.app/?demo=1', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));

// Find the longest contiguous run of .dt-outcome-seg widgets (29px tall, 51px apart
// within a rule group; 152px apart across sub-condition rows — use 100px threshold).
const outcomeRegion = await page.evaluate(() => {
  const toggles = Array.from(document.querySelectorAll('.dt-outcome-seg'));
  if (toggles.length === 0) return null;

  const rects = toggles
    .map(el => el.getBoundingClientRect())
    .filter(r => r.width > 10 && r.top > 0 && r.top < window.innerHeight);
  if (rects.length === 0) return null;

  rects.sort((a, b) => a.top - b.top);

  // Gap between consecutive same-group rows ≈ 51px; across sub-condition gap ≈ 152px
  let bestStart = 0, bestLen = 1, cur = 0, curLen = 1;
  for (let i = 1; i < rects.length; i++) {
    if (rects[i].top - rects[i - 1].bottom < 100) {
      curLen++;
      if (curLen > bestLen) { bestLen = curLen; bestStart = cur; }
    } else {
      cur = i; curLen = 1;
    }
  }
  const run = rects.slice(bestStart, bestStart + bestLen);

  const pad = 16;
  return {
    x: run[0].left - pad,
    y: run[0].top - pad,
    width: run[0].width + pad * 2,
    height: run[run.length - 1].bottom - run[0].top + pad * 2
  };
});

console.log('outcomeRegion:', JSON.stringify(outcomeRegion));
if (outcomeRegion) {
  await page.screenshot({
    path: `${OUT}/decisioning-table-outcome-toggles.png`,
    clip: {
      x: Math.max(0, Math.round(outcomeRegion.x)),
      y: Math.max(0, Math.round(outcomeRegion.y)),
      width: Math.min(Math.round(outcomeRegion.width), 1440),
      height: Math.min(Math.round(outcomeRegion.height), 860)
    }
  });
  console.log('✓ decisioning-table-outcome-toggles.png');
} else {
  console.log('⚠ Could not find .dt-outcome-seg elements, saving full page fallback');
  await page.screenshot({ path: `${OUT}/decisioning-table-outcome-toggles.png` });
}

// ── 6. decisioning-table-split-button.png ─────────────────────────────────
// Use page.click() directly (not evaluate) so Puppeteer synthesises a proper
// pointer event — evaluate().click() doesn't always trigger Radix/React handlers.
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto('https://decisioning-table.vercel.app/?demo=1', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));

// Click the chevron (second button inside .dt-split-btn)
let chevronFound = false;
try {
  await page.click('.dt-split-btn button:last-child');
  chevronFound = true;
} catch (e) {
  console.log('dt-split-btn selector failed:', e.message);
}

if (!chevronFound) {
  // Fallback: find the button rect via evaluate and click by coordinate
  const chevronRect = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent.includes('Add rule'));
    if (!addBtn) return null;
    const parent = addBtn.closest('.dt-split-btn') || addBtn.parentElement;
    const allBtns = parent ? Array.from(parent.querySelectorAll('button')) : [];
    const chevron = allBtns.length > 1 ? allBtns[allBtns.length - 1] : null;
    if (!chevron) return null;
    const r = chevron.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (chevronRect) {
    await page.mouse.click(chevronRect.x, chevronRect.y);
    chevronFound = true;
    console.log('chevron clicked via mouse at', chevronRect);
  }
}
console.log('chevron found:', chevronFound);
await new Promise(r => setTimeout(r, 600));

const splitRegion = await page.evaluate(() => {
  // Look for the open dropdown — Radix uses [data-state="open"] or [role="menu"]
  const menus = Array.from(document.querySelectorAll('[role="menu"], [data-state="open"][class*="content"], [class*="DropdownMenu"], [class*="dropdown-content"]'));
  const openMenu = menus.find(m => {
    const rect = m.getBoundingClientRect();
    return rect.width > 50 && rect.height > 20 && rect.top < window.innerHeight && rect.top > 0;
  });
  if (openMenu) {
    const menuRect = openMenu.getBoundingClientRect();
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent.includes('Add rule'));
    const btnRect = addBtn ? addBtn.closest('.dt-split-btn')?.getBoundingClientRect() ?? addBtn.getBoundingClientRect() : menuRect;
    const top = Math.min(btnRect.top, menuRect.top);
    const bottom = Math.max(btnRect.bottom, menuRect.bottom);
    const left = Math.min(btnRect.left, menuRect.left);
    const right = Math.max(btnRect.right, menuRect.right);
    return { x: left - 16, y: top - 8, width: right - left + 32, height: bottom - top + 16, source: 'menu' };
  }
  // Fallback: crop to top-right area where split button lives
  const buttons = Array.from(document.querySelectorAll('button'));
  const addBtn = buttons.find(b => b.textContent.includes('Add rule'));
  if (addBtn) {
    const parent = addBtn.closest('.dt-split-btn') || addBtn.parentElement;
    const r = (parent || addBtn).getBoundingClientRect();
    return { x: r.left - 20, y: r.top - 12, width: r.width + 40, height: r.height + 24, source: 'btn-only' };
  }
  return { x: 1060, y: 8, width: 380, height: 56, source: 'hardcoded' };
});

console.log('splitRegion:', JSON.stringify(splitRegion));
await page.screenshot({
  path: `${OUT}/decisioning-table-split-button.png`,
  clip: {
    x: Math.max(0, Math.round(splitRegion.x)),
    y: Math.max(0, Math.round(splitRegion.y)),
    width: Math.min(Math.round(splitRegion.width), 1440),
    height: Math.min(Math.round(splitRegion.height), 900 - Math.round(splitRegion.y))
  }
});
console.log('✓ decisioning-table-split-button.png');

await browser.close();
console.log('All done.');
