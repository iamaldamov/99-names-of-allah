import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.QA_BASE_URL || 'http://127.0.0.1:4173/99-names-of-allah/';
const sizes = [
  { width: 320, height: 740 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const failures = [];

try {
  for (const size of sizes) {
    const page = await browser.newPage({
      viewport: size,
      deviceScaleFactor: 1,
      isMobile: size.width <= 430,
      hasTouch: size.width <= 430,
    });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => {
      localStorage.setItem('99-names-welcome-seen', '1');
      localStorage.setItem('asma-ul-husna-progress', JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      localStorage.setItem('99-names-learning-path-v1', JSON.stringify({ passedStages: [], bestScores: {} }));
    });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.locator('.learning-path').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.path-stage-card').count(), 1, 'The learning path should show only the current stage');
    assert.equal(await page.locator('.daily-challenge').count(), 0, 'The legacy daily quiz must be removed');
    assert.equal(await page.locator('.compact-details:has(.practice-section)').count(), 0, 'The duplicate mini quiz must be removed');

    const initialLayout = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    assert.ok(initialLayout.document <= initialLayout.viewport + 1, `Horizontal overflow at ${size.width}px: ${JSON.stringify(initialLayout)}`);
    assert.ok(initialLayout.body <= initialLayout.viewport + 1, `Body overflow at ${size.width}px: ${JSON.stringify(initialLayout)}`);

    const examButton = page.locator('.path-exam-button').first();
    await examButton.waitFor({ state: 'visible' });
    await examButton.click();
    const dialog = page.locator('.path-exam-modal');
    await dialog.waitFor({ state: 'visible' });
    const examTransliteration = page.locator('.path-exam-translit');
    await examTransliteration.waitFor({ state: 'visible' });
    assert.ok((await examTransliteration.innerText()).trim().length > 0, 'Every exam question must show the Name transliteration');
    assert.equal(await page.getByText('Испытай свои знания', { exact: true }).count(), 0, 'The old daily five-question quiz must not appear');
    assert.equal(await page.getByText('ПЯТЬ ВОПРОСОВ КАЖДЫЙ ДЕНЬ', { exact: true }).count(), 0, 'The old daily quiz heading must be removed');
    const modalLayout = await dialog.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    assert.ok(modalLayout.left >= -1 && modalLayout.right <= size.width + 1, `Exam modal exceeds horizontal viewport at ${size.width}px: ${JSON.stringify(modalLayout)}`);
    assert.ok(modalLayout.top >= -1 && modalLayout.bottom <= size.height + 1, `Exam modal exceeds vertical viewport at ${size.width}px: ${JSON.stringify(modalLayout)}`);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Opening the exam should lock background scrolling');

    await page.keyboard.press('Shift+Tab');
    assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true, 'Keyboard focus must stay inside the exam dialog');
    await page.locator('.theme-toggle').focus();
    await page.keyboard.press('Tab');
    assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true, 'Tab navigation must return focus to the exam when focus escapes');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Closing the exam should restore background scrolling');

    await page.locator('.theme-toggle').click();
    await examButton.click();
    await dialog.waitFor({ state: 'visible' });
    const darkSurface = await dialog.evaluate(element => getComputedStyle(element).backgroundColor);
    assert.notEqual(darkSurface, 'rgb(255, 255, 255)', `Exam modal must not stay white in dark mode: ${darkSurface}`);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.locator('.theme-toggle').click();

    if (size.width === 390) {
      await page.locator('.catalog-toggle').click();
      await page.locator('.name-row').first().click();
      const lessonDialog = page.locator('.lesson-modal:not(.review-session-modal)');
      await lessonDialog.waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Opening a Name card should lock background scrolling');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await lessonDialog.evaluate(element => element.contains(document.activeElement)), true, 'Name card keyboard focus must remain inside the dialog');
      await page.keyboard.press('Escape');
      await lessonDialog.waitFor({ state: 'hidden' });
      assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Closing a Name card should restore background scrolling');

      await page.evaluate(() => {
        localStorage.setItem('asma-ul-husna-progress', JSON.stringify([]));
        localStorage.removeItem('99-names-swipe-hint-seen-v2');
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('.path-lesson:not(:disabled)').first().click();
      await lessonDialog.waitFor({ state: 'visible' });
      await page.locator('.swipe-hint').waitFor({ state: 'visible' });
      assert.equal(await page.locator('.swipe-hint svg').count(), 1, 'The first lesson should show an animated hand gesture hint');
      const swipe = async () => {
        await lessonDialog.dispatchEvent('pointerdown', { pointerType: 'touch', button: 0, clientX: 220, clientY: 300 });
        await lessonDialog.dispatchEvent('pointerup', { pointerType: 'touch', button: 0, clientX: 120, clientY: 300 });
      };
      await swipe();
      assert.match(await lessonDialog.getAttribute('aria-label'), /Имя 2 из 99/, 'The first lesson should allow swiping to its second name');
      await swipe();
      assert.match(await lessonDialog.getAttribute('aria-label'), /Имя 3 из 99/, 'The first lesson should allow swiping to its third name');
      await swipe();
      assert.match(await lessonDialog.getAttribute('aria-label'), /Имя 3 из 99/, 'The first lesson must stop after exactly three names');
      await page.keyboard.press('Escape');
      await lessonDialog.waitFor({ state: 'hidden' });
    }

    if (size.width <= 768) {
      await page.locator('.language-select').selectOption('ar');
      await page.waitForFunction(() => document.documentElement.dir === 'rtl');
      assert.equal(await page.locator('html').getAttribute('dir'), 'rtl', 'Arabic should enable right-to-left document direction');
      const rtlLayout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      assert.ok(rtlLayout.document <= rtlLayout.viewport + 1, `Arabic layout overflows at ${size.width}px: ${JSON.stringify(rtlLayout)}`);
      await examButton.click();
      await dialog.waitFor({ state: 'visible' });
      const closeRect = await page.locator('.path-exam-close').evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      });
      assert.ok(closeRect.left >= -1 && closeRect.right <= size.width + 1, `RTL close control is outside the viewport: ${JSON.stringify(closeRect)}`);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
    }

    assert.deepEqual(pageErrors, [], `Browser runtime errors at ${size.width}px: ${pageErrors.join('; ')}`);
    console.log(`Responsive QA passed: ${size.width}x${size.height}`);
    await page.close();
  }
} catch (error) {
  failures.push(error);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures[0]);
  process.exitCode = 1;
}
