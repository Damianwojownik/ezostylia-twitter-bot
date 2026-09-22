const fs = require('fs');
const path = require('path');
const {
  TAROT_CARDS,
  formatTweet,
  pickRandomCard,
  getLastCardIndex,
  saveLastCardIndex,
  STATE_FILE,
} = require('./bot');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${msg}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${msg}`);
  }
}

function cleanup() {
  try { fs.unlinkSync(STATE_FILE); } catch {}
}

console.log('\n🔮 Ezostylia Tarot Bot — Tests\n');

console.log('1. Card data');
assert(TAROT_CARDS.length === 78, `Total cards = ${TAROT_CARDS.length} (expected 78)`);

const allHaveFields = TAROT_CARDS.every(c => c.name && c.interp);
assert(allHaveFields, 'All cards have name and interp');

const names = TAROT_CARDS.map(c => c.name);
const uniqueNames = new Set(names);
assert(uniqueNames.size === 78, `All card names unique (${uniqueNames.size}/78)`);

console.log('\n2. Tweet length validation');
let maxLen = 0;
let maxCard = '';
let allFit = true;
for (const card of TAROT_CARDS) {
  const tweet = formatTweet(card);
  if (tweet.length > maxLen) { maxLen = tweet.length; maxCard = card.name; }
  if (tweet.length > 280) { allFit = false; }
}
assert(allFit, `All 78 tweets ≤ 280 chars (max: ${maxLen} — ${maxCard})`);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
