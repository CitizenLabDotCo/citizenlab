# citizenlab-ee

This repository contains scripts and tools to develop, test and deploy the enterprise edition of citizenlab.

## E2E tests

### Running tests on CI

#### Automatically

It runs automatically every weekday. If it fails, a slack notification is sent to #dev-notifications-e2e-tests channel.

It's configured in `nightly-e2e-tests` workflow in `.circleci/config.yml` file in this repo.

#### Manually

1. Go to citizenlab-ee project in CircleCI https://app.circleci.com/pipelines/github/CitizenLabDotCo/citizenlab-ee.
2. Select any citizenlab-ee branch.
3. Click "Trigger pipeline" button.
4. In the popup, add a new parameter (type - `boolean`, name - `e2e`, value - `true`).
5. [OPTIONAL] Select citizenlab main repo branch adding a new parameter (type - `string`, name - `citizenlab_branch`, value - `your-branch-name`). All parameters are listed in `parameters` section of `.circleci/config.yml` file in this repo.
6. Click "Trigger pipeline" button.

It's configured in `manually-e2e-tests` workflow in `.circleci/config.yml` file in this repo.

### Running tests locally

1. Start the server

```bash
cd citizenlab-ee/e2e
docker-compose build
docker-compose run web rake db:drop db:create db:migrate
docker-compose run web rake "cl2_back:create_tenant[e2e.front,e2etests_template]"
docker-compose up
```

2. Run Cypress tests

```bash
cd citizenlab-ee/e2e
docker-compose run --rm --name cypress_run front npm run cypress:run -- --config baseUrl=http://e2e.front:3000

# Or one specific test
docker-compose run --rm --name cypress_run front npm run cypress:run -- --config baseUrl=http://e2e.front:3000 --spec 'cypress/integration/about_page.ts'
```
