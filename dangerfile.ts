import { warn, message, danger } from "danger";

// Changelog modification
const hasChangelog = !danger.github.pr.body.includes(
  "<replace by bullet list items>"
);
if (!hasChangelog) {
  warn("The changelog is empty");
}

// PR title and branch Jira key reference
const extractJiraKeys = (str: string): string[] => {
  const jiraIssueRegex = new RegExp(`((CL2|OS|WOR|IN|TEC|EN|CL)-[0-9]+)`, "g");
  return Array.from(str.matchAll(jiraIssueRegex)).map((m) => m[0]);
};

const prKeys = extractJiraKeys(danger.github.pr.title);
if (prKeys.length === 0) {
  warn("The PR title contains no Jira issue key (case-sensitive)");
}

const branchKeys = extractJiraKeys(danger.github.pr.head.ref);
if (branchKeys.length === 0) {
  warn("The branch name contains no Jira issue key (case-sensitive)");
}

new Set([...branchKeys, ...prKeys]).forEach((jiraKey) => {
  message(
    `Jira issue: <a href="https://citizenlab.atlassian.net/browse/${jiraKey}">${jiraKey}</a>`
  );
});

// Link to trigger e2e tests
message(
  `<a href="https://epic.citizenlab.co/ci-e2e?citizenlab_branch=${danger.github.pr.head.ref}">Run the e2e tests</a>`
);

// Link to translations checker
message(
  `<a href="https://epic.citizenlab.co/translations/${danger.github.pr.head.ref.replace(
    "/",
    "."
  )}">Check translation progress</a>`
);
