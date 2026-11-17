#!/usr/bin/env bash
# bin/vendor-llm-skills.test.sh — tests for bin/vendor-llm-skills, run against
# a fake skills repo in a temp directory. Needs git and yq, like the script.
#
#   ./bin/vendor-llm-skills.test.sh
#
# Exits 0 if all tests pass, non-zero otherwise. Plain bash, no framework.

set -euo pipefail

SCRIPT_TO_TEST="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/vendor-llm-skills"

PASS=0
FAIL=0
FAILED_TESTS=()

pass() { PASS=$((PASS + 1)); echo "  ✓ $1"; }
fail() { FAIL=$((FAIL + 1)); FAILED_TESTS+=("$1"); echo "  ✗ $1" >&2; }

assert_eq() {
  local actual="$1" expected="$2" label="$3"
  if [ "$actual" = "$expected" ]; then
    pass "$label"
  else
    fail "$label"
    echo "    expected: '$expected'" >&2
    echo "    actual:   '$actual'" >&2
  fi
}

assert_path_missing() {
  if [ ! -e "$1" ] && [ ! -L "$1" ]; then
    pass "$2"
  else
    fail "$2 ($1 should not exist)"
  fi
}

TEST_TMP="$(mktemp -d)"
trap 'rm -rf "$TEST_TMP"' EXIT


# ============================================================================
# A fake skills repo: two plugins, one with shared files, and two commits
# ============================================================================

FAKE_REPO="$TEST_TMP/skills-repo"

write_file() {
  mkdir -p "$(dirname "$FAKE_REPO/$1")"
  printf '%s\n' "$2" > "$FAKE_REPO/$1"
}

commit_all() {
  git -C "$FAKE_REPO" add -A
  git -C "$FAKE_REPO" -c user.name=test -c user.email=test@example.com commit -q -m "$1"
}

git init -q "$FAKE_REPO"
write_file plugins/reporting/skills/report/SKILL.md 'report, first version'
write_file plugins/reporting/skills/report/references/charts.md 'charts'
write_file plugins/reporting/skills/report/data.json '{}'
write_file plugins/reporting/shared/voice.md 'voice'
write_file plugins/setup/skills/setup/SKILL.md 'setup'
write_file plugins/setup/skills/unlisted/SKILL.md 'unlisted'
commit_all 'First'
PINNED="$(git -C "$FAKE_REPO" rev-parse HEAD)"
write_file plugins/reporting/skills/report/SKILL.md 'report, second version'
commit_all 'Second'

export LLM_SKILLS_GIT_REMOTE="file://$FAKE_REPO"
export LLM_SKILLS_MANIFEST="$TEST_TMP/llm_skills.yml"

write_manifest() {
  local ref="$1"
  shift
  {
    echo "ref: '$ref'"
    echo "skills:"
    for skill in "$@"; do echo "  - $skill"; done
  } > "$LLM_SKILLS_MANIFEST"
}

run_script() {
  "$SCRIPT_TO_TEST" "$1" > "$TEST_TMP/stdout" 2> "$TEST_TMP/stderr"
}


# ============================================================================
# Tests
# ============================================================================

echo "Copies the listed skills at the pinned commit"
write_manifest "$PINNED" report setup
OUT_DIR="$TEST_TMP/copied/llm_skills"
if run_script "$OUT_DIR"; then
  pass "exits 0"
else
  fail "exits 0"
  sed 's/^/    /' "$TEST_TMP/stderr" >&2
fi
assert_eq "$(cd "$OUT_DIR" && find . -type f | LC_ALL=C sort)" "$(printf '%s\n' \
  ./plugins/reporting/shared/voice.md \
  ./plugins/reporting/skills/report/SKILL.md \
  ./plugins/reporting/skills/report/references/charts.md \
  ./plugins/setup/skills/setup/SKILL.md)" \
  "copies only the .md files of the listed skills and of their plugin's shared folder"
assert_eq "$(cat "$OUT_DIR/plugins/reporting/skills/report/SKILL.md")" 'report, first version' \
  "copies the pinned commit, not the latest"
if grep -q 'report, first version' "$TEST_TMP/stdout" "$TEST_TMP/stderr"; then
  fail "prints the skill names, not their text"
else
  pass "prints the skill names, not their text"
fi

echo "Fails on a skill that isn't at the pinned commit"
write_manifest "$PINNED" report missing-skill
OUT_DIR="$TEST_TMP/missing/llm_skills"
if run_script "$OUT_DIR"; then
  fail "exits non-zero"
else
  pass "exits non-zero"
fi
if grep -q 'missing-skill' "$TEST_TMP/stderr"; then
  pass "names the missing skill"
else
  fail "names the missing skill"
fi
assert_path_missing "$OUT_DIR" "leaves nothing behind"

echo "Fails without the remote"
write_manifest "$PINNED" report
OUT_DIR="$TEST_TMP/no-remote/llm_skills"
if LLM_SKILLS_GIT_REMOTE='' run_script "$OUT_DIR"; then
  fail "exits non-zero"
else
  pass "exits non-zero"
fi
assert_path_missing "$OUT_DIR" "leaves nothing behind"

echo "Leaves an existing folder alone"
OUT_DIR="$TEST_TMP/existing/llm_skills"
mkdir -p "$OUT_DIR"
touch "$OUT_DIR/keep"
if run_script "$OUT_DIR"; then
  fail "exits non-zero"
else
  pass "exits non-zero"
fi
if [ -f "$OUT_DIR/keep" ]; then
  pass "keeps what was there"
else
  fail "keeps what was there"
fi


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
