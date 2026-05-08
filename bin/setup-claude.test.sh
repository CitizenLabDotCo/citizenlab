#!/usr/bin/env bash
# bin/setup-claude.test.sh — tests for bin/setup-claude.
#
# Run from anywhere inside the citizenlab repo:
#   ./bin/setup-claude.test.sh
#
# Exits 0 if all tests pass, non-zero otherwise. Plain bash, no framework.
#
# Two flavours of test:
#
#   1. UNIT TESTS for the `relpath` helper inside bin/setup-claude. We can
#      call it directly because we source the script in "library mode" (see
#      below) — that lets us use the function without running the rest of
#      the script.
#
#   2. INTEGRATION TESTS that build a fake "private overlay" + "public repo"
#      pair inside a temp directory, run bin/setup-claude against them with
#      env vars overriding the real paths, then assert that the resulting
#      filesystem state (symlinks, cleanups, etc.) is correct.

# `set -euo pipefail` is bash's strict mode:
#   -e: exit immediately on any failed command (so a broken setup step
#       aborts the test run instead of producing misleading downstream
#       failures);
#   -u: error on unset variables (catches typos like `$TEST_TMP` vs
#       `$TEST_TEMP`);
#   -o pipefail: a pipeline's exit status is the rightmost non-zero one,
#       so a failing command in the middle of a pipe doesn't get masked.
set -euo pipefail

# Resolve the absolute directory this test script lives in, so paths work
# regardless of where the dev runs the script from. `BASH_SOURCE[0]` is
# the path of the current script; `cd ... && pwd` canonicalises it.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_TO_TEST="$SCRIPT_DIR/setup-claude"

# Source bin/setup-claude in "library mode": the BIN_SETUP_CLAUDE_LIBRARY=1
# env var tells the script to define its helpers (like `relpath`) and then
# `return` early before running the main mirror logic. After this line,
# the `relpath` function is available in this shell to call directly in
# unit tests.
BIN_SETUP_CLAUDE_LIBRARY=1 source "$SCRIPT_TO_TEST"


# ============================================================================
# Test framework
# ============================================================================
# A handful of helpers in lieu of a real framework. The test script tracks
# a passing and failing count, prints a checkmark or cross per assertion,
# and at the end exits non-zero if anything failed.

PASS=0
FAIL=0
FAILED_TESTS=()  # bash array; we append failed-test labels to it for the summary

# Print a green-ish checkmark and bump the pass count.
pass() { PASS=$((PASS + 1)); echo "  ✓ $1"; }

# Print a red-ish cross, bump the fail count, and remember the label so we
# can repeat the list at the end. `FAILED_TESTS+=("$1")` appends to the array.
fail() { FAIL=$((FAIL + 1)); FAILED_TESTS+=("$1"); echo "  ✗ $1" >&2; }

# Assert two strings match. If they don't, print expected vs actual to stderr
# so the test output makes the discrepancy obvious without re-running.
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

# Assert that `link` is a symlink whose target string matches `expected`.
# Note this checks the symlink TARGET STRING (e.g. "../private/CLAUDE.md"),
# not whether the target file exists or what it contains.
assert_symlink_to() {
  local link="$1" expected="$2" label="$3"
  if [ ! -L "$link" ]; then
    fail "$label (not a symlink: $link)"
    return
  fi
  # `readlink` prints the symlink's target string without resolving it.
  local actual; actual="$(readlink "$link")"
  assert_eq "$actual" "$expected" "$label"
}

# Assert that nothing exists at `path` — neither a regular file/dir (`-e`)
# nor a symlink (`-L`, even a broken one). Used to verify that cleanup
# steps removed what they were supposed to remove, or that we didn't
# create something we shouldn't have.
assert_path_missing() {
  if [ ! -e "$1" ] && [ ! -L "$1" ]; then
    pass "$2"
  else
    fail "$2 ($1 should not exist)"
  fi
}


# ============================================================================
# Unit tests: `relpath`
# ============================================================================
# `relpath TARGET ANCHOR` returns a relative path from ANCHOR to TARGET.
# Both inputs are absolute paths; the output is what you'd put in `ln -s`
# at ANCHOR to make a symlink resolve to TARGET. Used throughout
# bin/setup-claude to keep symlink targets relative (so a force-staged
# symlink wouldn't reveal a dev's home dir layout).
#
# The cases below exercise every shape of input the helper needs to handle:
#
#   - target nested below anchor → no `..`s in the output
#   - anchor nested below target → enough `..`s to escape up to a shared
#     parent, then descend
#   - target equals anchor → empty path
#   - sibling trees → single `..` to step across (this is the real-world
#     case bin/setup-claude relies on, since citizenlab/ and
#     citizenlab-claude/ are sibling clones under the same parent dir)
#   - no common ancestor at all → defensive fallback that returns the
#     absolute target (see the comment on that test case below for why
#     this matters)

echo "Unit tests: relpath"
assert_eq "$(relpath /a/b/c     /a/b)"        "c"             "target one level deeper"
assert_eq "$(relpath /a/b/c/d   /a/b)"        "c/d"           "target nested deeper"
assert_eq "$(relpath /a/b       /a/b/c)"      ".."            "anchor one level deeper"
assert_eq "$(relpath /a/b       /a/b/c/d)"    "../.."         "anchor two levels deeper"
assert_eq "$(relpath /a/b/c     /a/b/c)"      ""              "target equals anchor"
assert_eq "$(relpath /a/sib/x   /a/cl)"       "../sib/x"      "sibling tree (real-world case)"
assert_eq "$(relpath /a/sib/x/y /a/cl/z)"     "../../sib/x/y" "sibling tree at different depths"

# Edge case: target and anchor have NO common prefix at the string level
# (which can happen on macOS when one path has been canonicalised through
# the /var → /private/var symlink and the other hasn't). Without the
# safeguard added in bin/setup-claude, the function would infinite-loop.
# The safeguard makes it fall back to returning the absolute target.
assert_eq "$(relpath /var/x     /private/var/x)" "/var/x"      "no common ancestor: falls back to absolute (no infinite loop)"


# ============================================================================
# Integration test fixtures
# ============================================================================
# The integration tests construct a self-contained "fake universe" inside a
# temp directory, then run bin/setup-claude against it with env vars
# pointing at the fake paths. This way we exercise the real script
# end-to-end without touching the actual citizenlab / citizenlab-claude
# clones or any other state on the dev's machine.
#
# Layout per test run:
#
#   $TEST_TMP/
#     ├── remote.git/      a bare git repo standing in for the
#     │                    citizenlab-claude GitHub remote
#     ├── fixture-wt/      a working tree we use to seed `remote.git`
#     │                    with an initial commit of fixture content
#     ├── public/          stand-in for the citizenlab repo (where
#     │                    bin/setup-claude creates symlinks)
#     └── private/         stand-in for the local citizenlab-claude clone;
#                          created by bin/setup-claude on its first run
#                          when it clones from `remote.git`

TEST_TMP=""

# `trap ... EXIT` runs the given command when the script exits, for any
# reason — normal completion, error, or signal. We use it to clean up the
# tmpdir even if a test fails partway through.
trap '[ -n "${TEST_TMP:-}" ] && rm -rf "$TEST_TMP"' EXIT

# Build the fake universe described above. After this returns, REMOTE has
# fixture content, PUBLIC is a fresh git repo with the area dirs that
# host CLAUDE.md content, and PRIVATE doesn't exist yet (setup-claude
# clones it on first run).
setup_fake_env() {
  # Canonicalise the tmpdir path so it matches what `git rev-parse
  # --show-toplevel` returns inside the public repo. On macOS, `mktemp -d`
  # returns /var/folders/... while git canonicalises through the
  # /var → /private/var symlink. If we don't normalise here, `relpath`
  # inside setup-claude hits the no-common-ancestor edge case and falls
  # back to absolute paths, so the test assertions (which expect
  # relative paths like "../private/CLAUDE.md") would all fail.
  TEST_TMP="$(cd "$(mktemp -d)" && pwd -P)"
  REMOTE="$TEST_TMP/remote.git"
  PUBLIC="$TEST_TMP/public"
  PRIVATE="$TEST_TMP/private"
  FIXTURE_WT="$TEST_TMP/fixture-wt"

  # `git init --bare` creates a repo with no working tree (just the
  # `.git` internals). It's the standard format for a "remote" that
  # other clones push to / pull from.
  git init --bare -q "$REMOTE"

  # We can't add commits directly to a bare repo, so clone it into a
  # working tree, populate the fixture content there, commit, and push.
  # After this block, REMOTE has a single commit with the fixture content,
  # and FIXTURE_WT is a normal working tree we can use later in the
  # tests if we want to push more commits.
  #
  # `2>/dev/null` silences git's "warning: You appear to have cloned an
  # empty repository" — REMOTE is genuinely empty at this moment, by
  # design (we're about to populate it). The warning is harmless noise.
  # If the clone really fails, `cd "$FIXTURE_WT"` below will error and
  # the strict-mode `set -e` aborts the test run.
  git clone -q "$REMOTE" "$FIXTURE_WT" 2>/dev/null
  # Parens `( ... )` create a SUBSHELL: any `cd` inside doesn't affect
  # the parent shell's working directory. We use this pattern throughout
  # so we can safely `cd` into a temp dir without having to cd back.
  (
    cd "$FIXTURE_WT"
    mkdir -p back front hooks skills/test-skill commands
    echo '# root context'  > CLAUDE.md
    echo '# back context'  > back/CLAUDE.md
    echo '# front context' > front/CLAUDE.md
    # `<<'HOOK' ... HOOK` is a heredoc — multi-line literal string. The
    # quotes around 'HOOK' mean no shell interpolation happens inside,
    # which we want so the script content lands verbatim.
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
    # `-c user.email=...` sets the value just for this one git command,
    # avoiding any reliance on whatever `git config` is set to on the
    # dev's machine or the CI runner.
    git -c user.email=t@t -c user.name=t add -A
    git -c user.email=t@t -c user.name=t commit -q -m fixtures
    # Push to whatever default branch the local clone landed on (could be
    # `main` or `master` depending on the user's git defaults).
    git push -q origin "$(git rev-parse --abbrev-ref HEAD)"
  )

  # Public repo: needs to be a git repo (setup-claude calls
  # `git rev-parse --show-toplevel`) and needs the `back/` and `front/`
  # area directories to exist (otherwise setup-claude skips the
  # corresponding top-level CLAUDE.md symlinks). `.githooks/` is
  # required for the `git config core.hooksPath .githooks` step.
  mkdir -p "$PUBLIC/back" "$PUBLIC/front" "$PUBLIC/.githooks"
  (
    cd "$PUBLIC"
    git init -q
    # An initial commit gives `git rev-parse --show-toplevel` a stable
    # answer (works fine without it on most git versions, but explicit
    # is safer).
    git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init
  )
  # NB: PRIVATE itself is NOT created here. Setup-claude clones it from
  # REMOTE on its first run. That way we exercise the
  # "PRIVATE_DIR doesn't exist → clone" path; the second invocation in
  # the same test then exercises the "PRIVATE_DIR exists → pull" path.
}

# Run bin/setup-claude against the fake universe. Env var overrides:
#   CITIZENLAB_CLAUDE_GIT_REMOTE — where to clone the private overlay
#                                 from (our fake bare REMOTE);
#   CITIZENLAB_CLAUDE_DIR        — where to put the local clone of it
#                                 (our fake PRIVATE path).
# Output is silenced with `>/dev/null 2>&1` because we only care about
# the resulting filesystem state in assertions, not the script's chatter.
run_setup() {
  (
    cd "$PUBLIC"
    CITIZENLAB_CLAUDE_GIT_REMOTE="$REMOTE" \
    CITIZENLAB_CLAUDE_DIR="$PRIVATE" \
      bash "$SCRIPT_TO_TEST" >/dev/null 2>&1
  )
}


# ============================================================================
# Integration tests
# ============================================================================

echo ""
echo "Integration tests"


# ----------------------------------------------------------------------------
# Test: a fresh setup creates the symlinks we expect, in both their
# locations (top-level for CLAUDE.md, .claude/<rel> for everything else),
# with the correct relative paths back to the private overlay clone.
# ----------------------------------------------------------------------------
setup_fake_env
run_setup

# Top-level CLAUDE.md symlinks: <area>/CLAUDE.md → ../citizenlab-claude/...
# Claude Code's discovery walks up from CWD looking for these at fixed paths.
assert_symlink_to "$PUBLIC/CLAUDE.md"                          "../private/CLAUDE.md"                            "root CLAUDE.md → private"
assert_symlink_to "$PUBLIC/back/CLAUDE.md"                     "../../private/back/CLAUDE.md"                    "back/CLAUDE.md → private"
assert_symlink_to "$PUBLIC/front/CLAUDE.md"                    "../../private/front/CLAUDE.md"                   "front/CLAUDE.md → private"

# Everything else lands under .claude/<same-relative-path>. Symlink target
# `../`-counts depend on nesting depth (each level deeper adds one `../`).
assert_symlink_to "$PUBLIC/.claude/hooks/test-hook.sh"         "../../../private/hooks/test-hook.sh"             "hook script → private"
assert_symlink_to "$PUBLIC/.claude/skills/test-skill/SKILL.md" "../../../../private/skills/test-skill/SKILL.md"  "skill SKILL.md → private"
assert_symlink_to "$PUBLIC/.claude/commands/test.md"           "../../../private/commands/test.md"               "command → private"
assert_symlink_to "$PUBLIC/.claude/settings.local.json"        "../../private/settings.local.json"               "settings.local.json → private"

# Special case: the file named `.claude-readme.md` in the private overlay
# is renamed to `README.md` when it lands under .claude/. This makes the
# README appear at the conventional location in the public repo's view.
assert_symlink_to "$PUBLIC/.claude/README.md"                  "../../private/.claude-readme.md"                 ".claude/README.md → private .claude-readme.md"


# ----------------------------------------------------------------------------
# Test: setup-claude does NOT also mirror CLAUDE.md content under .claude/.
# CLAUDE.md content lives at the top-level paths only; mirroring it under
# .claude/ too would be redundant. Empty `.claude/<area>/` directories
# left over from the previous design (which DID mirror CLAUDE.md there)
# should be cleaned up.
# ----------------------------------------------------------------------------
assert_path_missing "$PUBLIC/.claude/CLAUDE.md"  ".claude/CLAUDE.md not created (lives at top-level instead)"
assert_path_missing "$PUBLIC/.claude/back"       ".claude/back/ empty dir cleaned up"
assert_path_missing "$PUBLIC/.claude/front"      ".claude/front/ empty dir cleaned up"


# ----------------------------------------------------------------------------
# Test: re-running setup-claude is safe and idempotent. Important because
# `make claude-setup` and `make reset-dev-env` may be run multiple times
# per dev session, and we don't want the second run to break the first
# run's state.
# ----------------------------------------------------------------------------
run_setup
assert_symlink_to "$PUBLIC/CLAUDE.md" "../private/CLAUDE.md" "second run: root symlink unchanged"


# ----------------------------------------------------------------------------
# Test: top-level CLAUDE.md is skipped when the corresponding area
# directory doesn't exist in the public repo. This avoids creating
# "phantom" directories: if `citizenlab-claude/foo/CLAUDE.md` exists
# but `citizenlab/foo/` doesn't, we should NOT auto-create `citizenlab/foo/`.
# ----------------------------------------------------------------------------
rm -rf "$PUBLIC/front"   # remove the area dir
run_setup
assert_path_missing "$PUBLIC/front" "front/ not auto-created when area dir missing (no phantom dir)"


# ----------------------------------------------------------------------------
# Test: a pre-existing regular file at a CLAUDE.md path gets overwritten
# with a symlink. Real-world scenario: a dev pulled master after the
# stub-deletion PR merged but hasn't run `make claude-setup` yet, so the
# old committed `CLAUDE.md` file might still be on their disk if they
# had local changes when pulling. Setup-claude should replace it with
# the symlink without making them clean up by hand.
# ----------------------------------------------------------------------------
rm -f "$PUBLIC/CLAUDE.md"               # remove the symlink from the previous test runs
echo "old stub" > "$PUBLIC/CLAUDE.md"   # plant a regular file in its place
run_setup
assert_symlink_to "$PUBLIC/CLAUDE.md" "../private/CLAUDE.md" "regular CLAUDE.md replaced by symlink"


# ----------------------------------------------------------------------------
# Test: migration cleanup of `.claude/private/`, the directory used by an
# earlier layout to hold private overlay content. After the flatten
# refactor, this directory should never exist; setup-claude removes it
# on every run as a one-shot migration cleanup. (Idempotent — no-op when
# the directory isn't present.)
# ----------------------------------------------------------------------------
mkdir -p "$PUBLIC/.claude/private/back"
echo "x" > "$PUBLIC/.claude/private/CLAUDE.md"
echo "x" > "$PUBLIC/.claude/private/back/CLAUDE.md"
run_setup
assert_path_missing "$PUBLIC/.claude/private" "obsolete .claude/private/ directory removed"


# ----------------------------------------------------------------------------
# Test: migration cleanup of an even older artifact — a directory symlink
# at `.claude/skills/private` that was the original (pre-per-file-symlink)
# design. Setup-claude removes it on every run.
# ----------------------------------------------------------------------------
ln -sfn "../../$PRIVATE/skills" "$PUBLIC/.claude/skills/private"
run_setup
assert_path_missing "$PUBLIC/.claude/skills/private" "obsolete .claude/skills/private symlink removed"


# ----------------------------------------------------------------------------
# Test: stale `<area>/CLAUDE.md` symlinks are cleaned up when their
# private content is removed. Scenario: a dev removes
# `citizenlab-claude/front/CLAUDE.md`, pushes, and the next
# `make claude-setup` should make `citizenlab/front/CLAUDE.md` disappear
# too — not leave a dangling symlink to a now-nonexistent file.
# ----------------------------------------------------------------------------
mkdir -p "$PUBLIC/front"   # restore the area dir we removed in an earlier test
# Modify the fixture: drop front/CLAUDE.md from the private overlay and
# push the change to REMOTE, so the next `git pull` inside setup-claude
# picks it up.
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


# ============================================================================
# Summary
# ============================================================================

echo ""
echo "Total: $((PASS + FAIL)) tests, $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  echo "Failed tests:" >&2
  # `printf '  - %s\n' "${FAILED_TESTS[@]}"` prints one line per array
  # element. Useful when there's more than one failure — repeats the list
  # at the end so it's easy to scan.
  printf '  - %s\n' "${FAILED_TESTS[@]}" >&2
  exit 1
fi
exit 0
