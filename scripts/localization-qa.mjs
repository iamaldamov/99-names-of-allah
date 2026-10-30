
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const locales = ['en', 'ar', 'ky', 'kk'];
const files = [
  { path: '../src/App.tsx', dictionary: 'languageText', translator: 'tr' },
  { path: '../src/GamifiedPath.tsx', dictionary: 'messages', translator: 't' }
];

function propertyName(name) {
  if (!name) return null;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function auditFile(file) {
  const sourcePath = new URL(file.path, import.meta.url);
  const sourceText = readFileSync(sourcePath, 'utf8');
  const sourceFile = ts.createSourceFile(file.path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const translations = new Map(locales.map(locale => [locale, new Set()]));
  const usedKeys = new Set();

  function addObjectTranslations(object, locale) {
    if (!ts.isObjectLiteralExpression(object) || !translations.has(locale)) return;
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = propertyName(property.name);
      if (key !== null) translations.get(locale).add(key);
    }
  }

  function visit(node) {
    if (ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === file.dictionary
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
        && target.expression.text === file.dictionary) {
        addObjectTranslations(node.arguments[1], target.name.text);
      }
    }

    if (ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && node.expression.text === file.translator
      && node.arguments.length > 0
      && ts.isStringLiteralLike(node.arguments[0])) {
      usedKeys.add(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  const missing = [];
  for (const locale of locales) {
    const absent = [...usedKeys].filter(key => !translations.get(locale).has(key));
    if (absent.length) missing.push({ locale, absent });
  }
  return { path: file.path, used: usedKeys.size, counts: Object.fromEntries(locales.map(locale => [locale, translations.get(locale).size])), missing };
}

const results = files.map(auditFile);
for (const result of results) {
  console.log(`${result.path}: checked ${result.used} literal UI keys; entries ${JSON.stringify(result.counts)}`);
  for (const { locale, absent } of result.missing) {
    console.error(`Missing ${locale} translations in ${result.path}:`);
    for (const key of absent) console.error(`  - ${key}`);
  }
}
assert.ok(results.every(result => result.missing.length === 0), 'Some visible UI messages are missing translations.');
console.log('Translation coverage passed for the main interface and learning path.');
