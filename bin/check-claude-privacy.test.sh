#!/usr/bin/env bash
# bin/check-claude-privacy.test.sh — tests for bin/check-claude-privacy.
#
# Run from anywhere inside the citizenlab repo:
#   ./bin/check-claude-privacy.test.sh
#
# Exits 0 if all tests pass, non-zero otherwise. Plain bash, no framework.
#
# `bin/check-claude-privacy` is the CI safety net: it runs in a CircleCI
# job on every PR, and refuses the PR if anything tracked under .claude/
# (other than the never-actually-existed settings.json carve-out we
# removed) or any tracked CLAUDE.md anywhere in the repo would leak
# private overlay content into the public repo.
#
# A regression in this script's logic could let a leak through silently —
# the "passes when it shouldn't" failure mode is the dangerous one,
# because it never produces a failing build for someone to investigate.
# These tests construct fake repo states (clean and various leak shapes),
# run the script against each, and assert it correctly passes or fails.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_TO_TEST="$SCRIPT_DIR/check-claude-privacy"


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

# Run the script-under-test inside the given repo and echo its exit code.
# We capture rather than letting the exit propagate because the test
# framework's strict mode (`set -e`) would otherwise abort on any
# non-zero exit — which is exactly what some test cases expect.
run_check_in() {
  local repo="$1"
  local exit_code=0
  ( cd "$repo" && bash "$SCRIPT_TO_TEST" >/dev/null 2>&1 ) || exit_code=$?
  echo "$exit_code"
}


# ============================================================================
# Test fixtures
# ============================================================================

TEST_TMP=""
trap '[ -n "${TEST_TMP:-}" ] && rm -rf "$TEST_TMP"' EXIT

# Build a fresh, empty git repo with one initial commit. Each test calls
# this to start from a known-clean state, then mutates from there.
setup_test_repo() {
  TEST_TMP="$(cd "$(mktemp -d)" && pwd -P)"
  REPO="$TEST_TMP/repo"
  mkdir -p "$REPO"
  (
    cd "$REPO"
    git init -q
    # Empty initial commit so `git ls-files` works deterministically.
    git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  )
}


# ============================================================================
# Tests
# ============================================================================

echo "Tests: bin/check-claude-privacy"


# ----------------------------------------------------------------------------
# Test: passes on a fully clean repo (nothing tracked that shouldn't be).
# This is the common case — every PR that doesn't touch private paths
# should pass through this check silently.
# ----------------------------------------------------------------------------
setup_test_repo
assert_exit_code "$(run_check_in "$REPO")" "0" "passes on clean repo"


# ----------------------------------------------------------------------------
# Test: fails when a CLAUDE.md is tracked at the repo root.
# This is the leak we'd see if someone force-added the file past the
# pre-commit hook (`git commit --no-verify`) or committed before the
# hook was installed. The CI check is what catches it.
# ----------------------------------------------------------------------------
setup_test_repo
echo "leaked content" > "$REPO/CLAUDE.md"
(
  cd "$REPO"
  # `git add -f` bypasses .gitignore. (Even though this fixture repo
  # has no .gitignore, this matches how a real leak would happen in
  # citizenlab where `**/CLAUDE.md` is gitignored.)
  git add -f CLAUDE.md
  git -c user.email=t@t -c user.name=t commit -q -m "leak"
)
assert_exit_code "$(run_check_in "$REPO")" "1" "fails when a tracked CLAUDE.md exists at root"


# ----------------------------------------------------------------------------
# Test: fails when a CLAUDE.md is tracked anywhere nested. The privacy
# rule covers `**/CLAUDE.md` (any depth), so a `back/CLAUDE.md` or
# `e2e/integration/CLAUDE.md` is just as much a leak as the root one.
# ----------------------------------------------------------------------------
setup_test_repo
mkdir -p "$REPO/sub/deeper"
echo "leaked content" > "$REPO/sub/deeper/CLAUDE.md"
(
  cd "$REPO"
  git add -f sub/deeper/CLAUDE.md
  git -c user.email=t@t -c user.name=t commit -q -m "nested leak"
)
assert_exit_code "$(run_check_in "$REPO")" "1" "fails when a nested tracked CLAUDE.md exists"


# ----------------------------------------------------------------------------
# Test: fails when something under `.claude/` is tracked. Same threat
# model as the CLAUDE.md cases — `.claude/` content (hooks, skills,
# commands, settings.json) should always be gitignored symlinks
# materialized at runtime, never committed.
# ----------------------------------------------------------------------------
setup_test_repo
mkdir -p "$REPO/.claude/hooks"
echo "secret hook script" > "$REPO/.claude/hooks/leak.sh"
(
  cd "$REPO"
  git add -f .claude/hooks/leak.sh
  git -c user.email=t@t -c user.name=t commit -q -m "leaky claude file"
)
assert_exit_code "$(run_check_in "$REPO")" "1" "fails when a file under .claude/ is tracked"


# ----------------------------------------------------------------------------
# Test: passes when a CLAUDE.md exists on disk but is NOT tracked by git.
# This is the normal post-`make claude-setup` state in citizenlab —
# CLAUDE.md files exist as gitignored symlinks. The check has to look
# at git's index, not the filesystem, otherwise it'd fail on every
# correctly-configured dev machine.
# ----------------------------------------------------------------------------
setup_test_repo
# Set up gitignore that mirrors citizenlab's, so git treats the file
# as ignored just like in production.
echo '**/CLAUDE.md' > "$REPO/.gitignore"
(
  cd "$REPO"
  git add .gitignore
  git -c user.email=t@t -c user.name=t commit -q -m "gitignore"
)
echo "this file exists but isn't tracked" > "$REPO/CLAUDE.md"
assert_exit_code "$(run_check_in "$REPO")" "0" "passes when CLAUDE.md exists on disk but is gitignored / untracked"


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
