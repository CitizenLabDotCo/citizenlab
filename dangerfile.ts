import { warn, message, danger } from "danger";

// Check whether the changelog was modified
const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md");
if (!hasChangelog) {
  warn("No changelog entry was added");
}

// Check whether PR and branch have reference to Jira issue
const JiraKeys = ["CL2", "OS", "WOR", "IN", "TEC"].join("|");
const prTitle = danger.github.pr.title;
const branchName = danger.github.pr.head.ref;
const jiraIssueRegex = new RegExp(`(${JiraKeys})-[0-9]+`, "g");

const matchPr = jiraIssueRegex.exec(prTitle);
if (!matchPr) {
  warn("The PR title contains no Jira issue key (case-sensitive)");
} else {
  const jiraKey = matchPr[0];
  message(
    `<a href="https://citizenlab.atlassian.net/browse/${jiraKey}">${jiraKey}</a>`
  );
}

const matchBranch = jiraIssueRegex.exec(branchName);
if (!matchBranch) {
  warn("The branch name contains no Jira issue key (case-sensitive)");
} else {
  const jiraKey = matchBranch[0];
  message(
    `<a href="https://citizenlab.atlassian.net/browse/${jiraKey}">${jiraKey}</a>`
  );
}
