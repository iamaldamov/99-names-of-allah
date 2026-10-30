import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const sourcePath = new URL('../src/App.tsx', import.meta.url);
const sourceText = readFileSync(sourcePath, 'utf8');
const sourceFile = ts.createSourceFile('src/App.tsx', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const localeNames = ['en', 'ar', 'ky', 'kk'];
const translations = new Map(localeNames.map(locale => [locale, new Set()]));
const usedKeys = new Set();

function propertyName(name) {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function addObjectTranslations(object, locale) {
  if (!ts.isObjectLiteralExpression(object) || !translations.has(locale)) return;
  const keys = translations.get(locale);
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = propertyName(property.name);
    if (key !== null) keys.add(key);
  }
}

function visit(node) {
  if (ts.isVariableDeclaration(node)
    && ts.isIdentifier(node.name)
    && node.name.text === 'languageText'
    && node.initializer
    && ts.isObjectLiteralExpression(node.initializer)) {
    for (const property of node.initializer.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      addObjectTranslations(property.initializer, propertyName(property.name));
    }
  }

  if (ts.isCallExpression(node)
    && ts.isPropertyAccessExpression(node.expression)
    && ts.isIdentifier(node.expression.expression)
    && node.expression.expression.text === 'Object'
    && node.expression.name.text === 'assign'
    && node.arguments.length >= 2) {
    const target = node.arguments[0];
    if (ts.isPropertyAccessExpression(target)
      && ts.isIdentifier(target.expression)
      && target.expression.text === 'languageText') {
      addObjectTranslations(node.arguments[1], target.name.text);
    }
  }

  if (ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === 'tr'
    && node.arguments.length > 0
    && ts.isStringLiteralLike(node.arguments[0])) {
    usedKeys.add(node.arguments[0].text);
  }

  ts.forEachChild(node, visit);
}

visit(sourceFile);

const missingByLocale = [];
for (const locale of localeNames) {
  const missing = [...usedKeys].filter(key => !translations.get(locale).has(key));
  if (missing.length) missingByLocale.push({ locale, missing });
}

console.log(`Checked ${usedKeys.size} literal UI translation keys across ${localeNames.length} locales.`);
for (const locale of localeNames) {
  console.log(`${locale}: ${translations.get(locale).size} translation entries`);
}
if (missingByLocale.length) {
  for (const { locale, missing } of missingByLocale) {
    console.error(`Missing ${locale} translations:`);
    for (const key of missing) console.error(`  - ${key}`);
  }
  assert.fail('Some visible UI messages are missing translations.');
}
console.log('Translation coverage passed.');
