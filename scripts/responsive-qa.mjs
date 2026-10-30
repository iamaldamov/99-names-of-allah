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
    await page.locator('.site-preloader').waitFor({ state: 'visible' });
    await page.locator('.learning-path').waitFor({ state: 'visible' });
    await page.locator('.site-preloader').waitFor({ state: 'hidden' });

    const uiContracts = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const unnamedButtons = buttons
        .filter(button => !(button.getAttribute('aria-label') || button.getAttribute('title') || button.innerText || '').trim())
        .map(button => button.outerHTML.slice(0, 180));
      const anchors = Array.from(document.querySelectorAll('a'));
      const brokenAnchors = anchors.filter(anchor => {
        const href = anchor.getAttribute('href');
        if (!href || !href.trim() || href.trim() === '#') return true;
        if (href.startsWith('#')) return !document.getElementById(href.slice(1));
        try { new URL(href, window.location.href); return false; } catch { return true; }
      }).map(anchor => anchor.outerHTML.slice(0, 180));
      const unsafeExternalLinks = anchors
        .filter(anchor => anchor.target === '_blank' && !/\\b(?:noopener|noreferrer)\\b/.test(anchor.rel))
        .map(anchor => anchor.outerHTML.slice(0, 180));
      const unlabeledControls = Array.from(document.querySelectorAll('input:not([type="hidden"]), select, textarea'))
        .filter(control => {
          const hasExplicitLabel = control.labels && control.labels.length > 0;
          return !hasExplicitLabel && !control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby');
        })
        .map(control => control.outerHTML.slice(0, 180));
      return { buttonCount: buttons.length, unnamedButtons, anchorCount: anchors.length, brokenAnchors, unsafeExternalLinks, unlabeledControls };
    });
    assert.deepEqual(uiContracts.unnamedButtons, [], `Buttons without an accessible name: ${JSON.stringify(uiContracts.unnamedButtons)}`);
    assert.deepEqual(uiContracts.brokenAnchors, [], `Links without a valid target: ${JSON.stringify(uiContracts.brokenAnchors)}`);
    assert.deepEqual(uiContracts.unsafeExternalLinks, [], `External links opened in a new tab must use noopener or noreferrer: ${JSON.stringify(uiContracts.unsafeExternalLinks)}`);
    assert.deepEqual(uiContracts.unlabeledControls, [], `Form controls without an accessible label: ${JSON.stringify(uiContracts.unlabeledControls)}`);
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
    const darkStyles = await dialog.evaluate(element => ({
      background: getComputedStyle(element).backgroundColor,
      color: getComputedStyle(element).color,
    }));
    assert.notEqual(darkStyles.background, 'rgb(255, 255, 255)', `Exam modal must not stay white in dark mode: ${darkStyles.background}`);
    assert.equal(darkStyles.background, 'rgb(24, 35, 29)', 'Exam modal should use the defined dark surface');
    assert.notEqual(darkStyles.color, 'rgb(0, 0, 0)', 'Exam text must remain readable in dark mode');
    const darkControls = await page.locator('.path-exam-close, .path-exam-options button').evaluateAll(elements =>
      elements.map(element => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }))
    );
    assert.ok(darkControls.length >= 5, 'The exam should show its close control and four answer options');
    assert.ok(darkControls.every(style => style.background !== 'rgb(255, 255, 255)'), 'No exam control may remain white in dark mode');
    await page.locator('.path-exam-options button').first().click();
    await page.locator('.path-exam-submit').click();
    const darkFeedback = await page.locator('.path-exam-feedback').evaluate(element => ({
      background: getComputedStyle(element).backgroundColor,
      color: getComputedStyle(element).color,
    }));
    assert.notEqual(darkFeedback.background, 'rgb(255, 255, 255)', 'Answer feedback must follow dark mode');
    assert.notEqual(darkFeedback.color, 'rgb(0, 0, 0)', 'Answer feedback text must remain readable in dark mode');
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.locator('.theme-toggle').click();

    if (size.width === 390) {
      await examButton.click();
      await dialog.waitFor({ state: 'visible' });
      for (let question = 0; question < 10; question += 1) {
        await page.locator('.path-exam-options button').first().click();
        await page.locator('.path-exam-submit').click();
        if (question < 9) {
          await page.locator('.path-exam-submit').click();
          await page.getByText(`ВОПРОС ${question + 2} ИЗ 10`, { exact: true }).waitFor({ state: 'visible' });
        } else {
          await page.locator('.path-exam-submit').click();
          await page.getByText('РЕЗУЛЬТАТ ЭКЗАМЕНА', { exact: true }).waitFor({ state: 'visible' });
        }
      }
      const examScoreText = await page.locator('.path-exam-result>strong').innerText();
      assert.match(examScoreText, /^\d+ из 10$/, 'The completed exam should show a score out of ten');
      const examScore = Number(examScoreText.split(' ')[0]);
      await page.waitForFunction(score => {
        const state = JSON.parse(localStorage.getItem('99-names-learning-path-v1') || '{}');
        return score >= 8 ? state.passedStages?.includes(1) : !state.passedStages?.includes(1);
      }, examScore);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
    }

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
