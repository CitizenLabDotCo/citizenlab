#!/usr/bin/env node

/**
 * Fast translation checker that handles the pattern:
 *   import messages from './messages'
 *   formatMessage(messages.clearStartDate)
 *
 * Performance optimization: Instead of reading files individually,
 * we do a single global search and extract all used keys at once.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const glob = require('glob');

// Configuration
const CONFIG = {
  translationsDir: 'app/translations',
  srcDir: 'app',
  locale: 'en',
  excludePatterns: [
    '**/node_modules/**',
    '**/*.test.{ts,tsx,js}',
    '**/*.stories.{ts,tsx,js}',
    '**/*.spec.{ts,tsx,js}',
  ],
  // Keys matching these patterns are known to be dynamically generated
  knownDynamicPatterns: [
    /^app\.containers\.Admin\.projects\.project\.error\./,
    /^app\.components\.Error\./,
    /^app\.api\.errors\./,
  ],
};

// Check if ripgrep is available (much faster than grep)
function hasRipgrep() {
  try {
    execSync('which rg', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

const USE_RIPGREP = hasRipgrep();

// Load all translation keys from the translation files
function loadTranslationKeys(translationsDir, locale) {
  const translationFiles = glob.sync(`${translationsDir}/**/${locale}.json`);
  const allKeys = new Map(); // key -> translation file

  translationFiles.forEach(file => {
    try {
      const translations = JSON.parse(fs.readFileSync(file, 'utf8'));
      Object.keys(translations).forEach(key => {
        allKeys.set(key, file);
      });
    } catch (error) {
      console.error(`⚠️  Error reading ${file}:`, error.message);
    }
  });

  return allKeys;
}

// Check if a key is likely dynamically generated
function isDynamicKey(key) {
  return CONFIG.knownDynamicPatterns.some(pattern => pattern.test(key));
}

// Extract all used message keys in a single pass
function extractAllUsedKeys(srcDir) {
  const usedKeys = new Set();

  try {
    let output;

    // Pattern 1: *Messages[digits].keyName (matches messages, messages2, sharedMessages, commonMessages, etc.)
    if (USE_RIPGREP) {
      output = execSync(
        'rg -o --no-filename --no-line-number "\\w*[Mm]essages\\d*\\.\\w+" app --type-not json --glob "!messages.*"',
        {
          stdio: 'pipe',
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024,
          shell: '/bin/bash',
        }
      );
    } else {
      output = execSync(
        'grep -roh --exclude="messages.*" --exclude="*.json" -E "\\w*[Mm]essages[0-9]*\\.\\w+" app',
        {
          stdio: 'pipe',
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024,
          shell: '/bin/bash',
        }
      );
    }

    const lines = output.trim().split('\n');
    lines.forEach(line => {
      const match = line.match(/\w*[Mm]essages\d*\.(\w+)/);
      if (match && match[1]) {
        usedKeys.add(match[1]);
      }
    });
  } catch (error) {
    if (error.status !== 1) throw error;
  }

  // Pattern 2: *Messages[digits][variable] - dynamic access (matches messages, messages2, sharedMessages, etc.)
  // Find files that use *Messages[...] pattern
  try {
    const dynamicFiles = USE_RIPGREP
      ? execSync('rg -l "\\w*[Mm]essages\\d*\\[" app --type-not json --glob "!messages.*"', {
          stdio: 'pipe',
          encoding: 'utf8',
          shell: '/bin/bash',
        })
      : execSync('grep -rl --exclude="messages.*" --exclude="*.json" "\\w*[Mm]essages[0-9]*\\[" app', {
          stdio: 'pipe',
          encoding: 'utf8',
          shell: '/bin/bash',
        });

    const files = dynamicFiles.trim().split('\n').filter(Boolean);

    // For each file with dynamic access, extract all message keys from nearby messages objects
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Look for messages imports or const declarations
        const messageVarPattern = /\w*[Mm]essages\d*\s*=\s*\{([^}]+)\}|import.*[Mm]essages.*from/g;
        if (messageVarPattern.test(content)) {
          // Find all potential keys in imported messages objects
          const keyPattern = /(\w+):/g;
          let match;
          while ((match = keyPattern.exec(content)) !== null) {
            if (match[1] && match[1] !== 'id' && match[1] !== 'defaultMessage' && match[1] !== 'description') {
              usedKeys.add(match[1]);
            }
          }
        }
      } catch (err) {
        // Skip files we can't read
      }
    });
  } catch (error) {
    if (error.status !== 1) throw error;
  }

  // Pattern 3: keyof typeof *Messages[digits] pattern - message: 'keyName'
  // Find files with "keyof typeof *Messages" and extract string values
  try {
    const keyofFiles = USE_RIPGREP
      ? execSync('rg -l "keyof typeof \\w*[Mm]essages\\d*" app --type-not json --glob "!messages.*"', {
          stdio: 'pipe',
          encoding: 'utf8',
          shell: '/bin/bash',
        })
      : execSync('grep -rl --exclude="messages.*" --exclude="*.json" "keyof typeof \\w*[Mm]essages[0-9]*" app', {
          stdio: 'pipe',
          encoding: 'utf8',
          shell: '/bin/bash',
        });

    const files = keyofFiles.trim().split('\n').filter(Boolean);

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        // Look for patterns like: message: 'keyName', labelKey: 'keyName', etc.
        const messagePattern = /(message|labelKey|messageKey):\s*['"](\w+)['"]/g;
        let match;
        while ((match = messagePattern.exec(content)) !== null) {
          if (match[2]) {
            usedKeys.add(match[2]);
          }
        }
      } catch (err) {
        // Skip files we can't read
      }
    });
  } catch (error) {
    if (error.status !== 1) throw error;
  }

  // Pattern 4: Direct id usage - formatMessage({ id: 'full.key.path' })
  try {
    let idOutput;
    if (USE_RIPGREP) {
      idOutput = execSync(
        'rg -o --no-filename --no-line-number "id:\\s*[\'\\"]\\w+[\\w\\.]*[\'\\"]" app --type-not json',
        {
          stdio: 'pipe',
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024,
          shell: '/bin/bash',
        }
      );
    } else {
      idOutput = execSync(
        'grep -roh --exclude="*.json" -E "id:\\s*[\'\\"]\\w+[\\w\\.]*[\'\\"]" app',
        {
          stdio: 'pipe',
          encoding: 'utf8',
          maxBuffer: 50 * 1024 * 1024,
          shell: '/bin/bash',
        }
      );
    }

    const idLines = idOutput.trim().split('\n');
    idLines.forEach(line => {
      const match = line.match(/id:\s*['"][\w.]*\.(\w+)['"]/);
      if (match && match[1]) {
        usedKeys.add(match[1]);
      }
    });
  } catch (error) {
    if (error.status !== 1) throw error;
  }

  return usedKeys;
}

// Format output for different modes
function formatOutput(unusedKeys, mode = 'standard') {
  if (mode === 'json') {
    return JSON.stringify({
      success: unusedKeys.length === 0,
      count: unusedKeys.length,
      unused: unusedKeys,
    }, null, 2);
  }

  // Standard format
  if (unusedKeys.length === 0) {
    return '✅ No unused translations found!';
  }

  let output = `❌ Found ${unusedKeys.length} potentially unused translations:\n\n`;
  output += '┌─────────────────────────────────────────────────────────────────────────────────────────────────┐\n';
  output += '│ Translation Key                                                    │ Defined in               │\n';
  output += '├─────────────────────────────────────────────────────────────────────────────────────────────────┤\n';

  unusedKeys.slice(0, 100).forEach(({ key, definedIn, isDynamic }) => {
    const shortPath = definedIn.replace(/^app\//, '').substring(0, 22);
    const keyDisplay = key.length > 66 ? key.substring(0, 63) + '...' : key;
    const flag = isDynamic ? ' 🔄' : '';
    output += `│ ${keyDisplay.padEnd(66)} │ ${shortPath.padEnd(24)}${flag} │\n`;
  });

  if (unusedKeys.length > 100) {
    output += `│ ... and ${unusedKeys.length - 100} more${' '.repeat(66)} │\n`;
  }

  output += '└─────────────────────────────────────────────────────────────────────────────────────────────────┘\n';
  output += '\n💡 Tips:\n';
  output += '   • Keys marked with 🔄 are likely dynamically generated\n';
  output += '   • Some results may be false positives if keys are constructed at runtime\n';
  output += '   • Review each key before removing it from translations\n';

  return output;
}

// Main function
function findUnusedTranslations(options = {}) {
  const { _internal = false } = options;
  const startTime = Date.now();

  const allKeys = loadTranslationKeys(CONFIG.translationsDir, CONFIG.locale);

  // Extract all used keys in a single pass
  const usedKeyParts = extractAllUsedKeys(CONFIG.srcDir);

  // Build mapping of full IDs to short key names from messages.ts files
  // This handles cases where the short key name doesn't match the last part of the ID
  // Example: approvalSubtitle -> app.containers.AdminPage.SettingsPage.approvalDescription
  const fullIdToShortKey = new Map();
  const messageFiles = glob.sync(`${CONFIG.srcDir}/**/messages.{ts,tsx,js}`);

  messageFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      // Match pattern: keyName: { id: 'full.id.path'
      const keyPattern = /(\w+):\s*\{\s*id:\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = keyPattern.exec(content)) !== null) {
        const shortKey = match[1];
        const fullId = match[2];
        fullIdToShortKey.set(fullId, shortKey);
      }
    } catch (err) {
      // Skip files we can't read
    }
  });

  // Check which full keys are unused
  const unusedKeys = [];

  for (const [fullKey, translationFile] of allKeys) {
    const keyPart = fullKey.match(/([^.]+)$/)?.[1];

    if (!keyPart) continue;

    // Get the short key name from messages.ts if available
    const shortKeyName = fullIdToShortKey.get(fullKey);

    // Check if key is used in multiple ways:
    // 1. Direct match with last part of ID
    // 2. Match with last part minus version suffix
    // 3. Match with short key name from messages.ts
    const keyPartWithoutVersion = keyPart.replace(/\d+$/, '');

    const isUsed = usedKeyParts.has(keyPart) ||
                   (keyPartWithoutVersion !== keyPart && usedKeyParts.has(keyPartWithoutVersion)) ||
                   (shortKeyName && usedKeyParts.has(shortKeyName));

    if (!isUsed) {
      unusedKeys.push({
        key: fullKey,
        definedIn: translationFile,
        isDynamic: isDynamicKey(fullKey),
      });
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  // When called internally (from other scripts), just return the data
  if (_internal) {
    return {
      success: unusedKeys.length === 0,
      count: unusedKeys.length,
      unused: unusedKeys,
      elapsed: parseFloat(elapsed),
    };
  }

  // CLI mode: output and exit
  const output = formatOutput(unusedKeys, 'standard');
  console.log(output);

  // Exit with error code if unused translations found
  if (unusedKeys.length > 0) {
    process.exit(1);
  }

  return {
    success: unusedKeys.length === 0,
    count: unusedKeys.length,
    unused: unusedKeys,
    elapsed: parseFloat(elapsed),
  };
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const helpRequested = args.includes('--help') || args.includes('-h');

  if (helpRequested) {
    console.log(`
Usage: node check-unused-translations.js

This script checks for unused translation keys and exits with code 1 if any are found.

Options:
  --help, -h Show this help message
`);
    process.exit(0);
  }

  try {
    findUnusedTranslations();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

module.exports = { findUnusedTranslations, loadTranslationKeys, extractAllUsedKeys };
