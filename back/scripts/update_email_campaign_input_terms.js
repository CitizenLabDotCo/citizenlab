#!/usr/bin/env node

/**
 * Script to add new input term entries (initiative, comment, response,
 * suggestion, topic, post, story) to all email campaign YAML locale files.
 *
 * For each locale file it finds the 5 blocks that are keyed by input term
 * and inserts new entries after the last existing entry (petition).
 *
 * For English locales, proper English text is used.
 * For non-English locales, English values are inserted as placeholders
 * (to be translated later via the normal translation workflow).
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(
  __dirname,
  '..',
  'engines',
  'free',
  'email_campaigns',
  'config',
  'locales'
);

// The new terms to add (initiative was missing, plus 6 brand new ones)
const NEW_TERMS = [
  'initiative',
  'comment',
  'response',
  'suggestion',
  'topic',
  'post',
  'story',
];

// English locale file names
const ENGLISH_LOCALES = ['en.yml', 'en-CA.yml', 'en-GB.yml', 'en-IE.yml'];

// English values for each block, keyed by block identifier
const ENGLISH_VALUES = {
  cta_goto: {
    initiative: "'Go to this initiative'",
    comment: "'Go to this comment'",
    response: "'Go to this response'",
    suggestion: "'Go to this suggestion'",
    topic: "'Go to this topic'",
    post: "'Go to this post'",
    story: "'Go to this story'",
  },
  cta_goto_your: {
    initiative: "'Go to your initiative'",
    comment: "'Go to your comment'",
    response: "'Go to your response'",
    suggestion: "'Go to your suggestion'",
    topic: "'Go to your topic'",
    post: "'Go to your post'",
    story: "'Go to your story'",
  },
  comment_on_idea_you_follow_main_header: {
    initiative:
      "'%{authorName} commented on an initiative you follow'",
    comment:
      "'%{authorName} commented on a comment you follow'",
    response:
      "'%{authorName} commented on a response you follow'",
    suggestion:
      "'%{authorName} commented on a suggestion you follow'",
    topic:
      "'%{authorName} commented on a topic you follow'",
    post:
      "'%{authorName} commented on a post you follow'",
    story:
      "'%{authorName} commented on a story you follow'",
  },
  idea_published_input_type_subject: {
    initiative: "'Your initiative has been published'",
    comment: "'Your comment has been published'",
    response: "'Your response has been published'",
    suggestion: "'Your suggestion has been published'",
    topic: "'Your topic has been published'",
    post: "'Your post has been published'",
    story: "'Your story has been published'",
  },
  your_input_in_screening_main_header: {
    initiative:
      "'Your initiative is in \"%{prescreening_status_title}\"'",
    comment:
      "'Your comment is in \"%{prescreening_status_title}\"'",
    response:
      "'Your response is in \"%{prescreening_status_title}\"'",
    suggestion:
      "'Your suggestion is in \"%{prescreening_status_title}\"'",
    topic:
      "'Your topic is in \"%{prescreening_status_title}\"'",
    post:
      "'Your post is in \"%{prescreening_status_title}\"'",
    story:
      "'Your story is in \"%{prescreening_status_title}\"'",
  },
};

/**
 * For a given block, find the line with `petition:` (the last existing term)
 * and insert new term lines after it.
 *
 * We search for the petition line within a specific block context to avoid
 * matching petition lines in other parts of the file.
 *
 * @param {string} content - Full file content
 * @param {string} blockMarker - A string that uniquely identifies the block header line
 * @param {string} blockKey - Key into ENGLISH_VALUES
 * @param {boolean} isEnglish - Whether this is an English locale
 * @returns {string} - Updated content
 */
function addTermsToBlock(content, blockMarker, blockKey, isEnglish) {
  const lines = content.split('\n');
  const blockMarkerIdx = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed === blockMarker;
  });

  if (blockMarkerIdx === -1) {
    // Block not found in this file, skip
    return content;
  }

  // Find the indentation of the entries within this block
  // Look at the line after the block marker to determine indentation
  let entryIndent = '';
  for (let i = blockMarkerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    // This should be the first entry (e.g., "        idea: '...'")
    const match = line.match(/^(\s+)\w+:/);
    if (match) {
      entryIndent = match[1];
      break;
    }
    break;
  }

  if (!entryIndent) {
    console.warn(
      `  WARNING: Could not determine indentation for block "${blockMarker}"`
    );
    return content;
  }

  // Find the petition line within this block
  // Start searching from blockMarkerIdx and find the `petition:` entry
  let petitionIdx = -1;
  for (let i = blockMarkerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // If we hit a line with less or equal indentation that's a new key, stop
    if (trimmed !== '' && !trimmed.startsWith('#')) {
      const lineIndentMatch = line.match(/^(\s*)/);
      const lineIndent = lineIndentMatch ? lineIndentMatch[1] : '';
      if (lineIndent.length < entryIndent.length && trimmed !== '') {
        break;
      }
    }

    if (trimmed.startsWith('petition:')) {
      petitionIdx = i;
      break;
    }
  }

  if (petitionIdx === -1) {
    console.warn(
      `  WARNING: No "petition:" entry found in block "${blockMarker}"`
    );
    return content;
  }

  // Check which terms already exist in this block
  const existingTerms = new Set();
  for (let i = blockMarkerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed !== '' && !trimmed.startsWith('#')) {
      const lineIndentMatch = line.match(/^(\s*)/);
      const lineIndent = lineIndentMatch ? lineIndentMatch[1] : '';
      if (lineIndent.length < entryIndent.length && trimmed !== '') {
        break;
      }
    }

    const termMatch = trimmed.match(/^(\w+):/);
    if (termMatch) {
      existingTerms.add(termMatch[1]);
    }
  }

  // Build new lines to insert
  const newLines = [];
  const values = ENGLISH_VALUES[blockKey];

  for (const term of NEW_TERMS) {
    if (existingTerms.has(term)) {
      continue; // Term already exists, skip
    }

    if (isEnglish) {
      newLines.push(`${entryIndent}${term}: ${values[term]}`);
    } else {
      // For non-English locales, use English values as placeholders
      newLines.push(`${entryIndent}${term}: ${values[term]}`);
    }
  }

  if (newLines.length === 0) {
    return content; // Nothing to add
  }

  // Insert after the petition line
  lines.splice(petitionIdx + 1, 0, ...newLines);
  return lines.join('\n');
}

function processFile(filePath) {
  const fileName = path.basename(filePath);
  const isEnglish = ENGLISH_LOCALES.includes(fileName);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Block 1: cta_goto (under general:)
  content = addTermsToBlock(content, 'cta_goto:', 'cta_goto', isEnglish);

  // Block 2: cta_goto_your (under general:)
  content = addTermsToBlock(
    content,
    'cta_goto_your:',
    'cta_goto_your',
    isEnglish
  );

  // Block 3: main_header (under comment_on_idea_you_follow:)
  // We need to be careful here - there are multiple main_header blocks
  // So we search for the specific one by finding comment_on_idea_you_follow first
  content = addTermsToBlockWithParent(
    content,
    'comment_on_idea_you_follow:',
    'main_header:',
    'comment_on_idea_you_follow_main_header',
    isEnglish
  );

  // Block 4: input_type_subject (under idea_published:)
  content = addTermsToBlockWithParent(
    content,
    'idea_published:',
    'input_type_subject:',
    'idea_published_input_type_subject',
    isEnglish
  );

  // Block 5: main_header (under your_input_in_screening:)
  content = addTermsToBlockWithParent(
    content,
    'your_input_in_screening:',
    'main_header:',
    'your_input_in_screening_main_header',
    isEnglish
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Updated: ${fileName}`);
  } else {
    console.log(`  No changes needed: ${fileName}`);
  }
}

/**
 * Similar to addTermsToBlock but first finds a parent block, then the
 * child block within it. This is needed for blocks like
 * comment_on_idea_you_follow: -> main_header:
 * where "main_header:" might appear multiple times in the file.
 */
function addTermsToBlockWithParent(
  content,
  parentMarker,
  childMarker,
  blockKey,
  isEnglish
) {
  const lines = content.split('\n');

  // Find the parent block
  const parentIdx = lines.findIndex((line) => {
    const trimmed = line.trim();
    return trimmed === parentMarker;
  });

  if (parentIdx === -1) {
    return content;
  }

  // Determine parent indentation
  const parentIndentMatch = lines[parentIdx].match(/^(\s*)/);
  const parentIndent = parentIndentMatch ? parentIndentMatch[1] : '';

  // Find the child block within the parent
  let childIdx = -1;
  for (let i = parentIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') continue;

    // Check if we've left the parent block (same or less indentation)
    const lineIndentMatch = line.match(/^(\s*)/);
    const lineIndent = lineIndentMatch ? lineIndentMatch[1] : '';
    if (lineIndent.length <= parentIndent.length && trimmed !== '') {
      break;
    }

    if (trimmed === childMarker) {
      childIdx = i;
      break;
    }
  }

  if (childIdx === -1) {
    return content;
  }

  // Determine entry indentation (lines inside the child block)
  let entryIndent = '';
  for (let i = childIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    const match = line.match(/^(\s+)\w+:/);
    if (match) {
      entryIndent = match[1];
      break;
    }
    break;
  }

  if (!entryIndent) {
    console.warn(
      `  WARNING: Could not determine indentation for "${parentMarker} -> ${childMarker}"`
    );
    return content;
  }

  // Find the petition line within this child block
  let petitionIdx = -1;
  const existingTerms = new Set();

  for (let i = childIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed !== '' && !trimmed.startsWith('#')) {
      const lineIndentMatch = line.match(/^(\s*)/);
      const lineIndent = lineIndentMatch ? lineIndentMatch[1] : '';
      if (lineIndent.length < entryIndent.length && trimmed !== '') {
        break;
      }
    }

    const termMatch = trimmed.match(/^(\w+):/);
    if (termMatch) {
      existingTerms.add(termMatch[1]);
      if (termMatch[1] === 'petition') {
        petitionIdx = i;
      }
    }
  }

  if (petitionIdx === -1) {
    console.warn(
      `  WARNING: No "petition:" found in "${parentMarker} -> ${childMarker}"`
    );
    return content;
  }

  // Build new lines
  const newLines = [];
  const values = ENGLISH_VALUES[blockKey];

  for (const term of NEW_TERMS) {
    if (existingTerms.has(term)) {
      continue;
    }
    newLines.push(`${entryIndent}${term}: ${values[term]}`);
  }

  if (newLines.length === 0) {
    return content;
  }

  lines.splice(petitionIdx + 1, 0, ...newLines);
  return lines.join('\n');
}

// Main
function main() {
  console.log('Updating email campaign YAML locale files...\n');
  console.log(`Locales directory: ${LOCALES_DIR}\n`);

  const files = fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => f.endsWith('.yml'))
    .sort();

  console.log(`Found ${files.length} locale files.\n`);

  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(LOCALES_DIR, file);
    const contentBefore = fs.readFileSync(filePath, 'utf8');

    processFile(filePath);

    const contentAfter = fs.readFileSync(filePath, 'utf8');
    if (contentBefore !== contentAfter) {
      updatedCount++;
    }
  }

  console.log(`\nDone! Updated ${updatedCount} files.`);
}

main();
