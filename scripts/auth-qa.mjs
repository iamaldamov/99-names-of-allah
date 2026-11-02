import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const checks = [
  ['Supabase recovery event opens the new-password form', /event === 'PASSWORD_RECOVERY'[\s\S]*?setAccountMode\('update'\)[\s\S]*?setAccountOpen\(true\)/],
  ['Password reset email redirects back to the site', /resetPasswordForEmail\(email\.trim\(\),\s*\{\s*redirectTo:\s*SITE_URL\s*\}\)/],
  ['New password is saved through Supabase updateUser', /auth\.updateUser\(\{\s*password\s*\}\)/],
  ['The update form asks for a new password', /accountMode === 'update' \? tr\('Новый пароль'\)/],
  ['The update form does not require the email again', /accountMode !== 'update' && <><label htmlFor="account-email">/],
  ['New passwords use new-password autocomplete', /accountMode === 'signup' \|\| accountMode === 'update' \? 'new-password'/],
  ['Password update success is announced outside the closed dialog', /setAccountOpen\(false\);\s*setPassword\(''\);\s*setNotice\(tr\('Новый пароль сохранён\. Ты вошёл в аккаунт\.'\)\)/],
];

for (const [description, pattern] of checks) {
  assert.match(source, pattern, description);
  console.log(`Auth QA passed: ${description}`);
}
