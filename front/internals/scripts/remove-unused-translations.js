#!/usr/bin/env node

/**
 * Remove unused translations from messages.ts files
 *
 * This script:
 * 1. Identifies unused translations
 * 2. Removes them from their corresponding messages.ts files
 * 3. Preserves file syntax and formatting
 * 4. Deletes empty messages.ts files
 * 5. Creates a backup before making changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');

// Import the checker to get unused translations
const { findUnusedTranslations } = require('./check-unused-translations.js');

const CONFIG = {
  translationsDir: 'app/translations',
  backupDir: '.unused-translations-backup',
  dryRun: false,
};

// Parse message file to extract message definitions
function parseMessageFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const messages = new Map(); // key -> { start, end, content }

  // Match defineMessages({ ... })
  const defineMessagesMatch = content.match(/defineMessages\s*\(\s*\{([\s\S]*)\}\s*\)/);
  if (!defineMessagesMatch) {
    console.warn(`⚠️  Could not parse defineMessages in ${filePath}`);
    return { messages, rawContent: content, hasDefineMessages: false };
  }

  const messagesBlock = defineMessagesMatch[1];
  const blockStart = defineMessagesMatch.index + defineMessagesMatch[0].indexOf('{') + 1;

  // Find each message key and its full definition
  // We need to manually parse to handle nested braces correctly
  let currentIndex = 0;
  const keyNamePattern = /(\w+)\s*:\s*\{/g;

  while (currentIndex < messagesBlock.length) {
    keyNamePattern.lastIndex = currentIndex;
    const keyMatch = keyNamePattern.exec(messagesBlock);

    if (!keyMatch) break;

    const keyName = keyMatch[1];
    const keyStartPos = blockStart + keyMatch.index;
    const openBracePos = blockStart + keyMatch.index + keyMatch[0].length - 1;

    // Find the matching closing brace
    let braceCount = 1;
    let pos = keyMatch.index + keyMatch[0].length;

    while (pos < messagesBlock.length && braceCount > 0) {
      const char = messagesBlock[pos];
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      pos++;
    }

    if (braceCount !== 0) {
      console.warn(`⚠️  Unmatched braces for key ${keyName} in ${filePath}`);
      break;
    }

    const closeBracePos = blockStart + pos;
    const fullMatch = content.substring(keyStartPos, closeBracePos);

    // Check if there's a trailing comma
    let actualEnd = closeBracePos;
    let searchPos = pos;
    while (searchPos < messagesBlock.length && /\s/.test(messagesBlock[searchPos])) {
      searchPos++;
    }
    if (searchPos < messagesBlock.length && messagesBlock[searchPos] === ',') {
      actualEnd = blockStart + searchPos + 1;
    }

    messages.set(keyName, {
      start: keyStartPos,
      end: actualEnd,
      content: fullMatch,
      keyName,
    });

    currentIndex = pos;
  }

  return { messages, rawContent: content, hasDefineMessages: true };
}

// Extract the full translation key (with dots) from message definition
function extractFullKeyFromMessage(messageContent) {
  const idMatch = messageContent.match(/id:\s*['"`]([^'"`]+)['"`]/);
  return idMatch ? idMatch[1] : null;
}

// Remove messages from file
function removeMessagesFromFile(filePath, keysToRemove) {
  const { messages, rawContent, hasDefineMessages } = parseMessageFile(filePath);

  if (!hasDefineMessages) {
    return { removed: 0, isEmpty: false };
  }

  // Build a map of short key name -> full key
  const keyMap = new Map();
  messages.forEach((info, shortKey) => {
    const fullKey = extractFullKeyFromMessage(info.content);
    if (fullKey) {
      keyMap.set(fullKey, shortKey);
    }
  });

  // Find which short keys to remove
  const shortKeysToRemove = new Set();
  keysToRemove.forEach(fullKey => {
    const shortKey = keyMap.get(fullKey);
    if (shortKey && messages.has(shortKey)) {
      shortKeysToRemove.add(shortKey);
    }
  });

  if (shortKeysToRemove.size === 0) {
    return { removed: 0, isEmpty: false };
  }

  // Sort positions in reverse order to remove from end to start
  const sortedMessages = Array.from(messages.entries())
    .filter(([key]) => shortKeysToRemove.has(key))
    .map(([key, info]) => info)
    .sort((a, b) => b.start - a.start);

  // Remove messages from content
  // Since we're removing in reverse order (end to start), we can safely
  // use the original positions without adjustment
  let newContent = rawContent;
  sortedMessages.forEach(info => {
    const before = newContent.substring(0, info.start);
    const after = newContent.substring(info.end);
    newContent = before + after;
  });

  // Clean up any double commas or trailing commas after all removals
  newContent = newContent.replace(/,\s*,/g, ',');
  newContent = newContent.replace(/\{\s*,/g, '{');
  newContent = newContent.replace(/,\s*\}/g, '}');

  // Clean up extra whitespace
  newContent = newContent.replace(/\n\n\n+/g, '\n\n');

  // Check if the messages object is now empty
  const stillHasMessages = /defineMessages\s*\(\s*\{[\s\S]*?(\w+)\s*:\s*\{/.test(newContent);

  return {
    removed: shortKeysToRemove.size,
    isEmpty: !stillHasMessages,
    newContent,
  };
}

// Create backup of all message files
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(CONFIG.backupDir, timestamp);

  console.log(`📦 Creating backup at ${backupPath}...`);

  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  fs.mkdirSync(backupPath, { recursive: true });

  // Copy all messages files to backup
  const messageFiles = glob.sync('app/**/messages.{ts,tsx,js}');
  messageFiles.forEach(file => {
    const destPath = path.join(backupPath, file);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(file, destPath);
  });

  console.log(`   ✅ Backed up ${messageFiles.length} files\n`);
  return backupPath;
}

// Restore from backup
function restoreFromBackup(backupPath) {
  console.log(`\n🔄 Restoring from backup: ${backupPath}...`);

  const backedUpFiles = glob.sync(`${backupPath}/**/*`, { nodir: true });
  backedUpFiles.forEach(backupFile => {
    const relativePath = backupFile.substring(backupPath.length + 1);
    fs.copyFileSync(backupFile, relativePath);
  });

  console.log('   ✅ Restored successfully');
}

// Main function
async function removeUnusedTranslations(options = {}) {
  const { dryRun = false, force = false, keysToRemove: specificKeys = null } = options;

  console.log('🗑️  Remove Unused Translations\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Get unused translations
  console.log('1️⃣  Finding unused translations...\n');

  const result = findUnusedTranslations({
    _internal: true
  });

  let unusedTranslations = result.unused || [];

  if (specificKeys) {
    // Filter to only specified keys
    unusedTranslations = unusedTranslations.filter(t => specificKeys.includes(t.key));
    console.log(`   Filtering to ${specificKeys.length} specified keys`);
  }

  if (unusedTranslations.length === 0) {
    console.log('✅ No unused translations to remove!\n');
    return { success: true, removed: 0, filesModified: 0, filesDeleted: 0 };
  }

  console.log(`   Found ${unusedTranslations.length} unused translations\n`);

  console.log(`2️⃣  Mapping translations to message files...\n`);

  // Build a more efficient mapping
  const keyToMessageFile = new Map();
  const messageFiles = glob.sync('app/**/messages.{ts,tsx,js}', {
    ignore: CONFIG.excludePatterns,
  });

  console.log(`   Found ${messageFiles.length} message files, analyzing...`);

  messageFiles.forEach(mf => {
    const { messages } = parseMessageFile(mf);
    messages.forEach((info, shortKey) => {
      const fullKey = extractFullKeyFromMessage(info.content);
      if (fullKey) {
        keyToMessageFile.set(fullKey, mf);
      }
    });
  });

  console.log(`   Mapped ${keyToMessageFile.size} keys to their message files\n`);

  // Regroup by actual message files
  const actualFileGroups = new Map();
  unusedTranslations.forEach(({ key }) => {
    const messageFile = keyToMessageFile.get(key);
    if (messageFile) {
      if (!actualFileGroups.has(messageFile)) {
        actualFileGroups.set(messageFile, []);
      }
      actualFileGroups.get(messageFile).push(key);
    }
  });

  console.log(`3️⃣  Will modify ${actualFileGroups.size} message files\n`);

  if (!dryRun && !force) {
    console.log('⚠️  This will modify your files. Options:');
    console.log('   --dry-run    : Preview changes without modifying files');
    console.log('   --force      : Skip this confirmation');
    console.log('\nRe-run with one of these flags to proceed.\n');
    return { success: false, removed: 0, filesModified: 0, filesDeleted: 0 };
  }

  let backupPath;
  if (!dryRun) {
    backupPath = createBackup();
  }

  // Update fileGroups to use the better mapping
  const fileGroups = actualFileGroups;

  // Process each file
  const stats = {
    filesModified: 0,
    filesDeleted: 0,
    keysRemoved: 0,
    errors: [],
  };

  console.log('4️⃣  Processing files...\n');

  for (const [filePath, keys] of fileGroups) {
    try {
      console.log(`   📝 ${filePath}`);
      console.log(`      Removing ${keys.length} keys: ${keys.slice(0, 3).map(k => k.split('.').pop()).join(', ')}${keys.length > 3 ? '...' : ''}`);

      const { removed, isEmpty, newContent } = removeMessagesFromFile(filePath, keys);

      if (dryRun) {
        if (isEmpty) {
          console.log(`      🗑️  Would DELETE file (all messages removed)`);
        } else {
          console.log(`      ✅ Would remove ${removed} messages`);
        }
      } else {
        if (isEmpty) {
          fs.unlinkSync(filePath);
          console.log(`      🗑️  DELETED file (all messages removed)`);
          stats.filesDeleted++;
        } else {
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`      ✅ Removed ${removed} messages`);
          stats.filesModified++;
        }
        stats.keysRemoved += removed;
      }

      console.log('');
    } catch (error) {
      console.error(`      ❌ Error: ${error.message}\n`);
      stats.errors.push({ file: filePath, error: error.message });
    }
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('📊 Summary\n');
  console.log(`   Keys removed: ${stats.keysRemoved}`);
  console.log(`   Files modified: ${stats.filesModified}`);
  console.log(`   Files deleted: ${stats.filesDeleted}`);
  console.log(`   Errors: ${stats.errors.length}`);

  if (!dryRun) {
    console.log(`\n   💾 Backup location: ${backupPath}`);
    console.log(`   To restore: node internals/scripts/remove-unused-translations.js --restore ${path.basename(backupPath)}`);
  }

  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors occurred:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });

    if (!dryRun) {
      console.log('\n🔄 Restoring from backup due to errors...');
      restoreFromBackup(backupPath);
      return { success: false, ...stats };
    }
  }

  console.log('=' .repeat(60));

  if (dryRun) {
    console.log('\n✅ Dry run complete. Use --force to apply changes.\n');
  } else {
    console.log('\n✅ Unused translations removed successfully!\n');
    console.log('⚠️  Next steps:');
    console.log('   1. Run: npm run extract-intl');
    console.log('   2. Review the changes with git diff');
    console.log('   3. Run tests to ensure nothing broke');
    console.log('   4. Commit the changes\n');
  }

  return { success: true, ...stats };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const helpRequested = args.includes('--help') || args.includes('-h');

  const restoreIndex = args.indexOf('--restore');
  const restoreBackup = restoreIndex >= 0 ? args[restoreIndex + 1] : null;

  if (helpRequested) {
    console.log(`
Usage: node remove-unused-translations.js [options]

Options:
  --dry-run       Preview changes without modifying files
  --force         Skip confirmation and apply changes
  --restore <id>  Restore from a specific backup
  --help, -h      Show this help message

Examples:
  # Preview what would be removed
  node remove-unused-translations.js --dry-run

  # Remove unused translations (with confirmation)
  node remove-unused-translations.js

  # Remove without confirmation
  node remove-unused-translations.js --force

  # Restore from backup
  node remove-unused-translations.js --restore 2025-01-15T10-30-00-000Z

Safety:
  - Automatic backup before any changes
  - Dry run mode to preview changes
  - Automatic rollback on errors
  - Preserves file syntax
  - Deletes empty message files
`);
    process.exit(0);
  }

  if (restoreBackup) {
    const backupPath = path.join(CONFIG.backupDir, restoreBackup);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupPath}`);
      console.log('\nAvailable backups:');
      const backups = fs.existsSync(CONFIG.backupDir)
        ? fs.readdirSync(CONFIG.backupDir)
        : [];
      backups.forEach(b => console.log(`   - ${b}`));
      process.exit(1);
    }
    restoreFromBackup(backupPath);
    process.exit(0);
  }

  removeUnusedTranslations({ dryRun, force })
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error.message);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    });
}

module.exports = { removeUnusedTranslations, parseMessageFile, removeMessagesFromFile };
