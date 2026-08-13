/*
 * Regenerates the backend's SMS segment calculator inputs from the
 * `sms-segments-calculator` npm package, so the Ruby port can never drift from
 * the JS library the frontend counts with.
 *
 * Emits two files:
 *   1. The GSM-7 lookup table, transcribed from the library's TypeScript source
 *      into a Ruby hash.
 *   2. A golden fixture of {body -> measurements}, produced by running the real
 *      library over a corpus. The Ruby spec replays it.
 *
 * Run from front/ after bumping the package:
 *   node internals/scripts/generate-sms-segment-parity.cjs
 */

const fs = require('fs');
const path = require('path');

const { SegmentedMessage } = require('sms-segments-calculator');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const ENGINE = path.join(REPO_ROOT, 'back/engines/free/email_campaigns');

const UNICODE_TO_GSM_TS = path.join(
  REPO_ROOT,
  'front/node_modules/sms-segments-calculator/src/libs/UnicodeToGSM.ts'
);
const RUBY_TABLE_OUT = path.join(
  ENGINE,
  'app/services/email_campaigns/sms/unicode_to_gsm.rb'
);
const FIXTURE_OUT = path.join(
  ENGINE,
  'spec/fixtures/sms_segment_parity.json'
);

const PACKAGE_VERSION = require('sms-segments-calculator/package.json').version;

// --- 1. GSM-7 table -------------------------------------------------------

// Lines look like `  0x000a: [0x0a],` or `  0x000c: [0x1b, 0x0a],`.
const ENTRY = /^\s*(0x[0-9a-f]{4}):\s*\[([^\]]+)\],\s*$/gm;

const parseTable = () => {
  const source = fs.readFileSync(UNICODE_TO_GSM_TS, 'utf8');
  const entries = [...source.matchAll(ENTRY)].map(([, codePoint, codeUnits]) => [
    codePoint,
    codeUnits.split(',').map((unit) => unit.trim()),
  ]);

  if (entries.length === 0) {
    throw new Error(`No entries parsed from ${UNICODE_TO_GSM_TS}`);
  }
  return entries;
};

const writeRubyTable = (entries) => {
  const rows = entries
    .map(([codePoint, codeUnits]) => `        ${codePoint} => [${codeUnits.join(', ')}]`)
    .join(',\n');

  const ruby = `# frozen_string_literal: true

# Generated from sms-segments-calculator v${PACKAGE_VERSION} by
# front/internals/scripts/generate-sms-segment-parity.cjs. Do not edit by hand.
module EmailCampaigns
  module Sms
    # Maps a UTF-16 code unit to the GSM-7 code units encoding it. A two-element
    # value marks a character from the GSM-7 extension table, which costs two septets.
    module UnicodeToGsm # rubocop:disable Metrics/ModuleLength
      MAP = {
${rows}
      }.freeze
    end
  end
end
`;

  fs.writeFileSync(RUBY_TABLE_OUT, ruby);
  console.log(`Wrote ${entries.length} GSM-7 entries to ${path.relative(REPO_ROOT, RUBY_TABLE_OUT)}`);
};

// --- 2. Parity fixture ----------------------------------------------------

const GSM_CODE_POINTS = parseTable().map(([codePoint]) => parseInt(codePoint, 16));
// The GSM-7 extension set: these cost two septets, so they segment differently.
const GSM_EXTENDED = '€[]{}\\|~^';

const corpus = () => {
  const bodies = new Set();
  const add = (body) => bodies.add(body);

  add('');
  add('a');
  add('A short SMS update.');

  // GSM-7 single/concatenated segment boundaries.
  [1, 159, 160, 161, 305, 306, 307, 458, 459, 1224, 1225].forEach((length) =>
    add('a'.repeat(length))
  );

  // UCS-2 boundaries: 70 alone, 67 per segment once concatenated.
  [1, 69, 70, 71, 133, 134, 135, 536, 537].forEach((length) => add('ж'.repeat(length)));

  // Every character the library considers GSM-7, alone and repeated past a segment.
  GSM_CODE_POINTS.forEach((codePoint) => {
    const char = String.fromCharCode(codePoint);
    add(char);
    add(char.repeat(100));
  });

  // An extension character straddling a segment edge cannot be split across it.
  for (let filler = 152; filler <= 160; filler++) {
    GSM_EXTENDED.split('').forEach((char) => add(`${'a'.repeat(filler)}${char}`));
  }

  // The same characters cost two septets in GSM-7 but a single 16-bit unit once
  // something else has forced the message onto UCS-2.
  GSM_EXTENDED.split('').forEach((char) => {
    add(`${char}ж`);
    for (let filler = 66; filler <= 70; filler++) {
      add(`${'ж'.repeat(filler)}${char}`);
    }
  });

  // Emoji: surrogate pairs, ZWJ sequences, skin-tone modifiers, flags.
  ['😀', '👍🏽', '👨‍👩‍👧', '🇧🇪', '👋🏻👋🏿'].forEach((emoji) => {
    add(emoji);
    add(emoji.repeat(20));
    add(`${'a'.repeat(60)}${emoji}`);
    add(`${'a'.repeat(66)}${emoji}`);
  });

  // Precomposed \u00e9 is in the GSM-7 table; the decomposed form is one grapheme
  // of two code units and forces UCS-2. Written as escapes rather than typed, so
  // the corpus cannot silently switch forms when this file is edited.
  ['\u00e9', 'e\u0301'].forEach((accented) => {
    add(accented);
    add(accented.repeat(50));
    add(`${'a'.repeat(159)}${accented}`);
  });

  // Characters that look GSM-7 but are not in the table, so they force UCS-2.
  add('ë');
  add('Vote for “Parc de l’Ouest” — merci!');
  add('naïve café résumé');

  // Line breaks.
  add('line one\nline two');
  add('line one\r\nline two');
  add('a\n'.repeat(80));

  // Mixed encodings and realistic bodies.
  add('Reminder: the survey closes tonight. Vote at https://example.org/p/abc 👍');
  add('Rappel : votre avis compte ! Répondez avant 18h.');
  add(`${'Meeting at the town hall. '.repeat(12)}😀`);

  return [...bodies];
};

const measure = (body) => {
  const message = new SegmentedMessage(body);

  return {
    body,
    segmentsCount: message.segmentsCount,
    encodingName: message.encodingName,
    messageSize: message.messageSize,
    totalSize: message.totalSize,
    numberOfCharacters: message.numberOfCharacters,
    numberOfUnicodeScalars: message.numberOfUnicodeScalars,
    nonGsmCharacters: message.getNonGsmCharacters(),
    // Per-segment sizes, so a bug that misplaces characters between segments
    // cannot hide behind a correct total. Upstream asserts this structurally.
    segmentSizes: message.segments.map((segment) => segment.sizeInBits()),
  };
};

const writeFixture = () => {
  const cases = corpus().map(measure);
  const fixture = {
    // Regenerate with front/internals/scripts/generate-sms-segment-parity.cjs
    generatedFrom: `sms-segments-calculator@${PACKAGE_VERSION}`,
    cases,
  };

  fs.mkdirSync(path.dirname(FIXTURE_OUT), { recursive: true });
  fs.writeFileSync(FIXTURE_OUT, `${JSON.stringify(fixture, null, 2)}\n`);
  console.log(`Wrote ${cases.length} parity cases to ${path.relative(REPO_ROOT, FIXTURE_OUT)}`);
};

writeRubyTable(parseTable());
writeFixture();
