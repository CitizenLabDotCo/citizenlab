#!/usr/bin/env bash
# bin/setup-claude.test.sh — tests for bin/setup-claude.
#
# Run from anywhere inside the citizenlab repo:
#   ./bin/setup-claude.test.sh
#
# Plain bash, no framework. Exits non-zero if any test fails.
# Constructs a fake "private overlay" + "public repo" pair in a tmpdir
# and exercises bin/setup-claude end-to-end without touching real state.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_TO_TEST="$SCRIPT_DIR/setup-claude"

# Source in library mode to access helpers (relpath)
BIN_SETUP_CLAUDE_LIBRARY=1 source "$SCRIPT_TO_TEST"

# --- Test framework ---

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

assert_symlink_to() {
  local link="$1" expected="$2" label="$3"
  if [ ! -L "$link" ]; then
    fail "$label (not a symlink: $link)"
    return
  fi
  local actual; actual="$(readlink "$link")"
  assert_eq "$actual" "$expected" "$label"
}

assert_path_missing() {
  if [ ! -e "$1" ] && [ ! -L "$1" ]; then
    pass "$2"
  else
    fail "$2 ($1 should not exist)"
  fi
}

# --- Unit tests: relpath ---

echo "Unit tests: relpath"
assert_eq "$(relpath /a/b/c     /a/b)"        "c"             "target one level deeper"
assert_eq "$(relpath /a/b/c/d   /a/b)"        "c/d"           "target nested deeper"
assert_eq "$(relpath /a/b       /a/b/c)"      ".."            "anchor one level deeper"
assert_eq "$(relpath /a/b       /a/b/c/d)"    "../.."         "anchor two levels deeper"
assert_eq "$(relpath /a/b/c     /a/b/c)"      ""              "target equals anchor"
assert_eq "$(relpath /a/sib/x   /a/cl)"       "../sib/x"      "sibling tree (real-world case)"
assert_eq "$(relpath /a/sib/x/y /a/cl/z)"     "../../sib/x/y" "sibling tree at different depths"
assert_eq "$(relpath /var/x     /private/var/x)" "/var/x"      "no common ancestor: falls back to absolute (no infinite loop)"

# --- Integration test fixtures ---

TEST_TMP=""
trap '[ -n "${TEST_TMP:-}" ] && rm -rf "$TEST_TMP"' EXIT

setup_fake_env() {
  # Canonicalize the tmpdir path so it matches what `git rev-parse
  # --show-toplevel` returns. On macOS, mktemp -d returns /var/folders/...
  # while git canonicalizes through the /var → /private/var symlink. If we
  # don't normalize here, relpath hits no-common-ancestor and falls back
  # to absolute paths — tests then assert against unstable absolute paths.
  TEST_TMP="$(cd "$(mktemp -d)" && pwd -P)"
  REMOTE="$TEST_TMP/remote.git"
  PUBLIC="$TEST_TMP/public"
  PRIVATE="$TEST_TMP/private"
  FIXTURE_WT="$TEST_TMP/fixture-wt"

  git init --bare -q "$REMOTE"

  # Populate the remote via a separate working tree
  git clone -q "$REMOTE" "$FIXTURE_WT"
  (
    cd "$FIXTURE_WT"
    mkdir -p back front hooks skills/test-skill commands
    echo '# root context'  > CLAUDE.md
    echo '# back context'  > back/CLAUDE.md
    echo '# front context' > front/CLAUDE.md
    cat > hooks/test-hook.sh <<'HOOK'
#!/usr/bin/env bash
exit 0
HOOK
    chmod +x hooks/test-hook.sh
    cat > skills/test-skill/SKILL.md <<'SKILL'
---
name: test-skill
description: test
---
SKILL
    echo '# test command' > commands/test.md
    echo '{}' > settings.local.json
    echo '# private overlay README' > .claude-readme.md
    echo 'private repo own README' > README.md
    git -c user.email=t@t -c user.name=t add -A
    git -c user.email=t@t -c user.name=t commit -q -m fixtures
    git push -q origin "$(git rev-parse --abbrev-ref HEAD)"
  )

  # Public repo: needs to exist as a git repo with the area dirs that have CLAUDE.md content
  mkdir -p "$PUBLIC/back" "$PUBLIC/front" "$PUBLIC/.githooks"
  (
    cd "$PUBLIC"
    git init -q
    git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  )
  # PRIVATE is created by setup-claude on first run (via clone from REMOTE)
}

run_setup() {
  (
    cd "$PUBLIC"
    CITIZENLAB_CLAUDE_GIT_REMOTE="$REMOTE" \
    CITIZENLAB_CLAUDE_DIR="$PRIVATE" \
      bash "$SCRIPT_TO_TEST" >/dev/null 2>&1
  )
}

# --- Integration tests ---

echo ""
echo "Integration tests"

# Test: fresh setup creates the expected symlinks (top-level CLAUDE.md + .claude/<rel>)
setup_fake_env
run_setup
assert_symlink_to "$PUBLIC/CLAUDE.md"                          "../private/CLAUDE.md"                            "root CLAUDE.md → private"
assert_symlink_to "$PUBLIC/back/CLAUDE.md"                     "../../private/back/CLAUDE.md"                    "back/CLAUDE.md → private"
assert_symlink_to "$PUBLIC/front/CLAUDE.md"                    "../../private/front/CLAUDE.md"                   "front/CLAUDE.md → private"
assert_symlink_to "$PUBLIC/.claude/hooks/test-hook.sh"         "../../../private/hooks/test-hook.sh"             "hook script → private"
assert_symlink_to "$PUBLIC/.claude/skills/test-skill/SKILL.md" "../../../../private/skills/test-skill/SKILL.md"  "skill SKILL.md → private"
assert_symlink_to "$PUBLIC/.claude/commands/test.md"           "../../../private/commands/test.md"               "command → private"
assert_symlink_to "$PUBLIC/.claude/settings.local.json"        "../../private/settings.local.json"               "settings.local.json → private"
assert_symlink_to "$PUBLIC/.claude/README.md"                  "../../private/.claude-readme.md"                 ".claude/README.md → private .claude-readme.md"

# .claude/ should not redundantly mirror CLAUDE.md content; empty area dirs cleaned up
assert_path_missing "$PUBLIC/.claude/CLAUDE.md"  ".claude/CLAUDE.md not created (lives at top-level instead)"
assert_path_missing "$PUBLIC/.claude/back"       ".claude/back/ empty dir cleaned up"
assert_path_missing "$PUBLIC/.claude/front"      ".claude/front/ empty dir cleaned up"

# Test: idempotent — second run produces the same state
run_setup
assert_symlink_to "$PUBLIC/CLAUDE.md" "../private/CLAUDE.md" "second run: root symlink unchanged"

# Test: top-level CLAUDE.md is skipped when the area dir doesn't exist in citizenlab
rm -rf "$PUBLIC/front"
run_setup
assert_path_missing "$PUBLIC/front" "front/ not auto-created when area dir missing (no phantom dir)"

# Test: pre-existing regular file at a CLAUDE.md path is replaced by a symlink (migration case)
rm -f "$PUBLIC/CLAUDE.md"
echo "old stub" > "$PUBLIC/CLAUDE.md"
run_setup
assert_symlink_to "$PUBLIC/CLAUDE.md" "../private/CLAUDE.md" "regular CLAUDE.md replaced by symlink"

# Test: migration cleanup — pre-existing .claude/private/ directory is removed
mkdir -p "$PUBLIC/.claude/private/back"
echo "x" > "$PUBLIC/.claude/private/CLAUDE.md"
echo "x" > "$PUBLIC/.claude/private/back/CLAUDE.md"
run_setup
assert_path_missing "$PUBLIC/.claude/private" "obsolete .claude/private/ directory removed"

# Test: migration cleanup — obsolete .claude/skills/private dir-symlink is removed
ln -sfn "../../$PRIVATE/skills" "$PUBLIC/.claude/skills/private"
run_setup
assert_path_missing "$PUBLIC/.claude/skills/private" "obsolete .claude/skills/private symlink removed"

# Test: stale CLAUDE.md symlink cleaned up after private content drops
mkdir -p "$PUBLIC/front"  # restore the area dir
(
  cd "$FIXTURE_WT"
  git pull -q --ff-only
  rm front/CLAUDE.md
  git -c user.email=t@t -c user.name=t add -A
  git -c user.email=t@t -c user.name=t commit -q -m "drop front"
  git push -q
)
run_setup
assert_path_missing "$PUBLIC/front/CLAUDE.md" "stale front/CLAUDE.md symlink cleaned up after private content removal"

# --- Summary ---

echo ""
echo "Total: $((PASS + FAIL)) tests, $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  echo "Failed tests:" >&2
  printf '  - %s\n' "${FAILED_TESTS[@]}" >&2
  exit 1
fi
exit 0
