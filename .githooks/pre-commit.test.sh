#!/usr/bin/env bash
# .githooks/pre-commit.test.sh — tests for .githooks/pre-commit.
#
# Run from anywhere inside the citizenlab repo:
#   ./.githooks/pre-commit.test.sh
#
# Exits 0 if all tests pass, non-zero otherwise. Plain bash, no framework.
#
# `.githooks/pre-commit` is the active layer of the privacy guard system:
# when a dev runs `git commit`, the hook fires before the commit is
# created and refuses to proceed if any private overlay path or any
# CLAUDE.md is staged. This catches `git add -f` bypasses (where someone
# force-stages a path past .gitignore) at commit time, before the leak
# reaches a remote. (The CI privacy check is the final backstop, but
# catching it locally is faster and clearer for the dev.)
#
# These tests construct fake repo states that mimic the situations the
# hook is designed to block (and not block), attempt commits, and assert
# that each is allowed or rejected as expected.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK_TO_TEST="$SCRIPT_DIR/pre-commit"


# ============================================================================
# Test framework
# ============================================================================

PASS=0
FAIL=0
FAILED_TESTS=()

pass() { PASS=$((PASS + 1)); echo "  ✓ $1"; }
fail() { FAIL=$((FAIL + 1)); FAILED_TESTS+=("$1"); echo "  ✗ $1" >&2; }

assert_exit_code() {
  local actual="$1" expected="$2" label="$3"
  if [ "$actual" = "$expected" ]; then
    pass "$label"
  else
    fail "$label"
    echo "    expected exit code: $expected" >&2
    echo "    actual exit code:   $actual" >&2
  fi
}


# ============================================================================
# Test fixtures
# ============================================================================

TEST_TMP=""
trap '[ -n "${TEST_TMP:-}" ] && rm -rf "$TEST_TMP"' EXIT

# Build a fresh git repo with the hook installed at .githooks/pre-commit
# and `core.hooksPath` pointing there. Each test starts from this clean
# state, then stages something and tries to commit.
setup_test_repo() {
  TEST_TMP="$(cd "$(mktemp -d)" && pwd -P)"
  REPO="$TEST_TMP/repo"
  mkdir -p "$REPO/.githooks"
  cp "$HOOK_TO_TEST" "$REPO/.githooks/pre-commit"
  chmod +x "$REPO/.githooks/pre-commit"
  (
    cd "$REPO"
    git init -q
    # Tell git to invoke hooks from .githooks/ (matching how
    # bin/setup-claude wires hooks up in the real repo).
    git config core.hooksPath .githooks
    git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  )
}

# Attempt a commit in $REPO and echo its exit code. `extra_flags` lets
# tests pass `--no-verify` to verify the bypass case.
attempt_commit() {
  local extra_flags="${1:-}"
  local exit_code=0
  (
    cd "$REPO"
    # Stderr captured to stdout and discarded — the hook prints error
    # messages there for the dev's benefit, but they're noise during
    # the test. We only care about the exit code.
    git -c user.email=t@t -c user.name=t commit $extra_flags -q -m "test commit" >/dev/null 2>&1
  ) || exit_code=$?
  echo "$exit_code"
}


# ============================================================================
# Tests
# ============================================================================

echo "Tests: .githooks/pre-commit"


# ----------------------------------------------------------------------------
# Test: a normal file commits without obstruction. This is the common
# case — every commit that doesn't touch privacy-sensitive paths should
# pass through the hook silently.
# ----------------------------------------------------------------------------
setup_test_repo
echo "ok" > "$REPO/normal.txt"
( cd "$REPO" && git add normal.txt )
assert_exit_code "$(attempt_commit)" "0" "allows commit of a normal file"


# ----------------------------------------------------------------------------
# Test: blocks commit when a CLAUDE.md is force-staged. This is the
# leak shape the hook exists to catch — someone has bypassed .gitignore
# with `git add -f`, and we need to refuse the commit before it lands.
# ----------------------------------------------------------------------------
setup_test_repo
echo "leaked content" > "$REPO/CLAUDE.md"
( cd "$REPO" && git add -f CLAUDE.md )
assert_exit_code "$(attempt_commit)" "1" "blocks commit when a CLAUDE.md is staged"


# ----------------------------------------------------------------------------
# Test: blocks commit when a nested CLAUDE.md (e.g. back/CLAUDE.md) is
# staged. Same rule: any CLAUDE.md anywhere is a privacy violation.
# ----------------------------------------------------------------------------
setup_test_repo
mkdir -p "$REPO/sub"
echo "leaked content" > "$REPO/sub/CLAUDE.md"
( cd "$REPO" && git add -f sub/CLAUDE.md )
assert_exit_code "$(attempt_commit)" "1" "blocks commit when a nested CLAUDE.md is staged"


# ----------------------------------------------------------------------------
# Test: blocks commit when a file under .claude/ is staged. Hooks,
# skills, commands, and settings.local.json all live under .claude/
# and should never be committed.
# ----------------------------------------------------------------------------
setup_test_repo
mkdir -p "$REPO/.claude/hooks"
echo "secret hook" > "$REPO/.claude/hooks/leak.sh"
( cd "$REPO" && git add -f .claude/hooks/leak.sh )
assert_exit_code "$(attempt_commit)" "1" "blocks commit when a file under .claude/ is staged"


# ----------------------------------------------------------------------------
# Test: `git commit --no-verify` bypasses the hook. We test this not
# because we want to encourage it but because it's a documented escape
# valve for genuine emergencies and we want to confirm it still works
# (a hook that refused even --no-verify would be a bug — the dev would
# have to delete the hook file to commit, which is worse). The CI
# privacy check is the backstop that catches `--no-verify` bypasses.
# ----------------------------------------------------------------------------
setup_test_repo
echo "leaked content" > "$REPO/CLAUDE.md"
( cd "$REPO" && git add -f CLAUDE.md )
assert_exit_code "$(attempt_commit --no-verify)" "0" "--no-verify bypasses the hook"


# ============================================================================
# Summary
# ============================================================================

echo ""
echo "Total: $((PASS + FAIL)) tests, $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  echo "Failed tests:" >&2
  printf '  - %s\n' "${FAILED_TESTS[@]}" >&2
  exit 1
fi
exit 0
