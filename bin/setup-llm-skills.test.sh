#!/usr/bin/env bash
# bin/setup-llm-skills.test.sh — tests for bin/setup-llm-skills, run against a
# fake citizenlab and a fake skills repo in a temp directory. Needs git and yq,
# like the script.
#
#   ./bin/setup-llm-skills.test.sh
#
# Exits 0 if all tests pass, non-zero otherwise. Plain bash, no framework.

set -euo pipefail

SCRIPT_TO_TEST="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/setup-llm-skills"

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

assert_succeeds() {
  if "$@" > "$TEST_TMP/stdout" 2> "$TEST_TMP/stderr"; then
    pass "exits 0"
  else
    fail "exits 0"
    sed 's/^/    /' "$TEST_TMP/stderr" >&2
  fi
}

assert_fails() {
  if "$@" > "$TEST_TMP/stdout" 2> "$TEST_TMP/stderr"; then
    fail "exits non-zero"
  else
    pass "exits non-zero"
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


# ============================================================================
# A fake citizenlab, with the manifest and the folder the script writes to
# ============================================================================

export LLM_SKILLS_REPO_ROOT="$TEST_TMP/citizenlab"
export LLM_SKILLS_GIT_REMOTE="file://$FAKE_REPO"
SKILLS_DIR="$LLM_SKILLS_REPO_ROOT/back/vendor/llm_skills"
REPORT_SKILL="$SKILLS_DIR/plugins/reporting/skills/report/SKILL.md"
mkdir -p "$LLM_SKILLS_REPO_ROOT/back/config"

write_manifest() {
  local ref="$1"
  shift
  {
    echo "ref: '$ref'"
    echo "skills:"
    for skill in "$@"; do echo "  - $skill"; done
  } > "$LLM_SKILLS_REPO_ROOT/back/config/llm_skills.yml"
}


# ============================================================================
# Tests
# ============================================================================

echo "Copies the listed skills at the pinned commit"
write_manifest "$PINNED" report setup
assert_succeeds "$SCRIPT_TO_TEST"
assert_eq "$(cd "$SKILLS_DIR" && find . -type f | LC_ALL=C sort)" "$(printf '%s\n' \
  ./plugins/reporting/shared/voice.md \
  ./plugins/reporting/skills/report/SKILL.md \
  ./plugins/reporting/skills/report/references/charts.md \
  ./plugins/setup/skills/setup/SKILL.md)" \
  "copies only the .md files of the listed skills and of their plugin's shared folder"
assert_eq "$(cat "$REPORT_SKILL")" 'report, first version' "copies the pinned commit, not the latest"
if grep -q 'report, first version' "$TEST_TMP/stdout" "$TEST_TMP/stderr"; then
  fail "prints the skill names, not their text"
else
  pass "prints the skill names, not their text"
fi

echo "Replaces the previous copy"
touch "$SKILLS_DIR/stale.md"
assert_succeeds "$SCRIPT_TO_TEST"
if [ -e "$SKILLS_DIR/stale.md" ]; then
  fail "removes what is no longer listed"
else
  pass "removes what is no longer listed"
fi

echo "Replaces a link without touching what it points to"
mkdir -p "$TEST_TMP/linked"
touch "$TEST_TMP/linked/keep"
rm -rf "$SKILLS_DIR"
ln -s "$TEST_TMP/linked" "$SKILLS_DIR"
assert_succeeds "$SCRIPT_TO_TEST"
if [ -d "$SKILLS_DIR" ] && [ ! -L "$SKILLS_DIR" ]; then
  pass "puts a copy in place of the link"
else
  fail "puts a copy in place of the link"
fi
if [ -f "$TEST_TMP/linked/keep" ]; then
  pass "keeps what the link pointed to"
else
  fail "keeps what the link pointed to"
fi

echo "Reads the remote from env_files/back-secret.env"
mkdir -p "$LLM_SKILLS_REPO_ROOT/env_files"
echo "LLM_SKILLS_GIT_REMOTE=\"file://$FAKE_REPO\"" > "$LLM_SKILLS_REPO_ROOT/env_files/back-secret.env"
LLM_SKILLS_GIT_REMOTE='' assert_succeeds "$SCRIPT_TO_TEST"
rm -r "$LLM_SKILLS_REPO_ROOT/env_files"

echo "Copies from a clone with --from, uncommitted edits included"
write_file plugins/reporting/skills/report/SKILL.md 'report, draft'
LLM_SKILLS_GIT_REMOTE='' assert_succeeds "$SCRIPT_TO_TEST" --from "$FAKE_REPO"
assert_eq "$(cat "$REPORT_SKILL")" 'report, draft' "copies the clone as it is"

echo "Fails with --from a folder that isn't a clone of the skills repo"
assert_fails "$SCRIPT_TO_TEST" --from "$TEST_TMP"
assert_eq "$(cat "$REPORT_SKILL")" 'report, draft' "keeps the previous copy"

echo "Fails on a skill that isn't at the pinned commit"
write_manifest "$PINNED" report missing-skill
assert_fails "$SCRIPT_TO_TEST"
if grep -q 'missing-skill' "$TEST_TMP/stderr"; then
  pass "names the missing skill"
else
  fail "names the missing skill"
fi
assert_eq "$(cat "$REPORT_SKILL")" 'report, draft' "keeps the previous copy"

echo "Fails without the remote"
write_manifest "$PINNED" report
LLM_SKILLS_GIT_REMOTE='' assert_fails "$SCRIPT_TO_TEST"
assert_eq "$(cat "$REPORT_SKILL")" 'report, draft' "keeps the previous copy"


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
