const test = require('node:test');
const assert = require('node:assert');
const { getKeywords, calculateScore } = require('../services/matcher');

test('Matcher - getKeywords should remove stop words and punctuation', () => {
  const text = "A blue wallet with an ID card and some cash in it!";
  const keywords = getKeywords(text);
  
  assert.strictEqual(keywords.has('a'), false);
  assert.strictEqual(keywords.has('with'), false);
  assert.strictEqual(keywords.has('and'), false);
  assert.strictEqual(keywords.has('blue'), true);
  assert.strictEqual(keywords.has('wallet'), true);
  assert.strictEqual(keywords.has('card'), true);
  assert.strictEqual(keywords.has('cash'), true);
});

test('Matcher - calculateScore returns 0 when categories differ', () => {
  const lostItem = {
    category: 'wallet',
    location: 'Library',
    date: new Date('2026-11-10'),
    title: 'Black leather wallet',
    description: 'Lost near the reception'
  };

  const foundItem = {
    category: 'phone',
    location: 'Library',
    date: new Date('2026-11-10'),
    title: 'Black leather wallet',
    description: 'Lost near the reception'
  };

  const score = calculateScore(lostItem, foundItem);
  assert.strictEqual(score, 0);
});

test('Matcher - calculates correct score for exact category and location', () => {
  const lostItem = {
    category: 'wallet',
    location: 'Library',
    date: new Date('2026-11-01'),
    title: 'Wallet',
    description: ''
  };

  const foundItem = {
    category: 'wallet',
    location: 'Library',
    date: new Date('2026-11-20'), // > 7 days apart
    title: 'Wallet',
    description: ''
  };

  // 40 (category) + 25 (location) + 0 (date) + 20 (title match: 'wallet')
  const score = calculateScore(lostItem, foundItem);
  assert.strictEqual(score, 85);
});

test('Matcher - calculates date proximity bonus (3 days vs 7 days)', () => {
  const baseDate = new Date('2026-11-10T12:00:00Z');
  const twoDaysLater = new Date('2026-11-12T12:00:00Z');
  const fiveDaysLater = new Date('2026-11-15T12:00:00Z');

  const lost = {
    category: 'keys',
    location: 'Canteen',
    date: baseDate,
    title: 'Car key',
    description: ''
  };

  const foundNear = {
    category: 'keys',
    location: 'Main Gate', // different location
    date: twoDaysLater, // <= 3 days: +15
    title: 'Bike key',
    description: ''
  };

  const foundMid = {
    category: 'keys',
    location: 'Main Gate', // different location
    date: fiveDaysLater, // <= 7 days: +8
    title: 'Bike key',
    description: ''
  };

  // Lost: { 'car', 'key' }, Found: { 'bike', 'key' }. Shared: 'key' (1). Smaller set: 2. 1/2 * 20 = 10 pts
  // foundNear: 40 (category) + 0 (loc) + 15 (date) + 10 (keywords) = 65
  // foundMid: 40 (category) + 0 (loc) + 8 (date) + 10 (keywords) = 58
  const scoreNear = calculateScore(lost, foundNear);
  const scoreMid = calculateScore(lost, foundMid);

  assert.strictEqual(scoreNear, 65);
  assert.strictEqual(scoreMid, 58);
});

test('Matcher - perfect match yields 100 and caps at 100', () => {
  const now = new Date();
  const lostItem = {
    category: 'phone',
    location: 'Library',
    date: now,
    title: 'Black iPhone 13 Pro in clear case',
    description: 'On 2nd floor desk near window'
  };

  const foundItem = {
    category: 'phone',
    location: 'Library',
    date: now,
    title: 'Black iPhone 13 Pro in clear case',
    description: 'On 2nd floor desk near window'
  };

  const score = calculateScore(lostItem, foundItem);
  assert.strictEqual(score, 100);
});
