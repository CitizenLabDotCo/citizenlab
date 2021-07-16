## Checklist

- [ ] Added entry to changelog
<details>
<summary>More info</summary>
Add a concise line to the 'Next release' section of the changelog (docs/README.md) so people other than developers can understand what has changed where. E.g. 'Added an error message to the project name field of the project edit form (Admin > Projects > Edit)'.
</details>

- [ ] Tests
<details>
<summary>More info</summary>

### Unit tests (front-end only)

Did you add relevant unit tests?

### E2E tests

Sometimes it can be more efficient to update E2E tests after CI has run them. If you know which ones to update, go ahead! E2E template cl2-back: docker-compose run --rm web bundle exec rake cl2_back:create_tenant[localhost,e2etests_template]

</details>

- [ ] Prepared branch for code review
<details>
<summary>More info</summary>
Reviewed code to reduce unnecessary back and forth (removal of console.log, comments, ...)? Added comments to clarify code, emphasize what to pay attention to, etc.?
</details>

## Links

- [Jira ticket](**put URL here**)
- [citizenlab-ee PR](**put URL here** or remove)
- [Specs](**put URL here** or remove)
- [Epic Deployment](**put URL here** or remove)

## What changes are in this PR?

Add a concise summary here of what happened, so the reviewer has some background.

## How urgent is a code review?

Let the reviewer(s) know how urgent the code review is, so they can prioritize their work accordingly. Be specific (e.g. by Wednesday, end of the day/this week/... is better than 'urgent' or 'very urgent'). Optionally provide a word of explanation on your deadline.
