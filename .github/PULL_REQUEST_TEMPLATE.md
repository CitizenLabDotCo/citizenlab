- [Jira ticket](URL here)
- [Related PR](URL here)
- [Specs](URL here)
- [Epic Deployment](URL here)

- [ ] Review and add comments to your code?
- [ ] update E2E tests? (E2E template cl2-back: `docker-compose run --rm web bundle exec rake cl2_back:create_tenant[localhost,e2etests_template]`)

# What changes are in this PR?

Add a concise summary here of what happened, so the reviewer has some background.

# More info
## Before asking for this PR to be reviewed:
- Add a link to Jira ticket
- Add a link to the PRs from other repos related to this 
- Add a summary of what has changed
- Review and prepare your own code to reduce unnecessary back and forth (removal of console.log etc.)
- While doing the above, add comments to your code to clarify, add questions you still have, etc.

## Before merging this PR to master:
- Add a concise line to the 'Next release' section of the changelog (docs/README.md) so people other than developers can understand what has changed where. E.g. 'Added an error message to the project name field of the project edit form (Admin > Projects > Edit)'.
- If possible, make sure E2E tests pass. Otherwise fix them after they've run after making the PR from master to production.
