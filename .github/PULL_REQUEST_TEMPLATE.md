- [ ] Added entry to changelog
> Add a concise line to the 'Next release' section of the changelog (docs/README.md) people other than developers can understand what has changed where. E.g. 'Added an error message to the project name field of the project edit form (Admin > Projects > Edit)'.

- [ ] Prepared branch for code review 
> Reviewed and added comments to code to reduce unnecessary back and forth and clarify code, emphasize what to pay attention to, etc.?

- [ ] Updated E2E tests 
> Sometimes it can be more efficient to update E2E tests after CI has run them. If you know which ones to update, go ahead! E2E template cl2-back: `docker-compose run --rm web bundle exec rake cl2_back:create_tenant[localhost,e2etests_template]`

- [Jira ticket](URL here)
- [Related PR](URL here)
- [Specs](URL here)
- [Epic Deployment](URL here)

# What changes are in this PR?

Add a concise summary here of what happened, so the reviewer has some background.

