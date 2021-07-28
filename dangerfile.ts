import { warn, danger } from "danger";

// Check whether the changelog was modified
const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md");
if (!hasChangelog) {
  warn("No changelog entry was added");
}
