# You can run this file with `make` command:
# make reset-dev-env
# make up

# All commands from this file should work in bash too after:
# 1. replacing $$ with $
# 2. replacing variables in ${} with some values, so `-u ${CIRCLE_CI_TOKEN}:` becomes `-u XXX:`

# =================
# Dev env
# =================

build:
	docker-compose build
	cd front && npm install

reset-dev-env:
	# -v removes volumes with all the data inside https://docs.docker.com/compose/reference/down/
	docker-compose down -v || true # do not exit on error (some networks may be present, volumes may be used, which is often fine)
	make build
	# https://citizenlabco.slack.com/archives/C016C2EHURY/p1644234622002569
	docker-compose run --rm web "bin/rails db:create && bin/rails db:reset"
	docker-compose run --rm -e RAILS_ENV=test web bin/rails db:drop db:create db:schema:load

migrate:
	docker-compose run --rm web bin/rails db:migrate

be-up:
	docker-compose up

fe-up:
	cd front && npm start

up:
	make -j 2 be-up fe-up

# Run it with:
# make c
# # or
# make rails-console
c rails-console:
	docker-compose run --rm web bin/rails c

# Runs rails console in an existing web container. May be useful if you need to access localhost:4000 in the console.
# E.g., this command works in this console `curl http://localhost:4000`
rails-console-exec:
	docker exec -it "$$(docker ps | awk '/cl-back-web/ {print $$1}' | head -1)" bin/rails c

# =================
# E2E tests
# =================
#
# https://www.notion.so/citizenlab/Testing-253d0c3cd99841a59929f7f615179935?pvs=4#6a0fc23d220c4afeb90bbd0cb7dbc0f5

# After running this command, start the dev servers as usual (make up)
e2e-setup:
	make build
	docker-compose run --rm web bin/rails db:drop db:create db:schema:load
	docker-compose run --rm web bin/rails cl2_back:create_tenant[localhost,e2etests_template]

e2e-setup-and-up:
	make e2e-setup
	make up

# Run it with:
# make e2e-run-test file=cypress/e2e/about_page.cy.ts
e2e-run-test:
	cd front && \
	npm run cypress:run -- --config baseUrl=http://localhost:3000 --spec ${file}

# -----------------
# The following e2e commands use the "ci-env" prefix which means
# that the used environment will be very similar to CI (the same docker-compose.yml file)
# -----------------

e2e-ci-env-setup:
	cd e2e && \
	docker-compose build && \
	docker-compose run web bin/rails db:drop db:create db:schema:load && \
	docker-compose run web bin/rails "cl2_back:create_tenant[e2e.front,e2etests_template]"

e2e-ci-env-setup-and-up:
	make e2e-ci-env-setup
	cd e2e && docker-compose up

# Run it with:
# make e2e-ci-env-run-test file=cypress/e2e/about_page.cy.ts
e2e-ci-env-run-test:
	cd e2e && \
	docker-compose run --rm --name cypress_run front npm run cypress:run -- --config baseUrl=http://e2e.front:3000 --spec ${file}

# =================
# CircleCI
# =================
#
# 1. Generate your personal API token:
#   go to CircleCI's user settings > Personal API Tokens https://app.circleci.com/settings/user/tokens
# 2. Export it in your shell:
#   e.g., add this line to your .bashrc or .zshrc
#   export CIRCLE_CI_TOKEN=XXX

ci-regenerate-templates:
	curl \
		--request POST \
		-u ${CIRCLE_CI_TOKEN}: \
		--url https://circleci.com/api/v2/project/github/CitizenLabDotCo/citizenlab/pipeline \
		--header 'content-type: application/json' \
		--data '{"branch": "production", "parameters": {"templates": true}}'

# Triggers a build for the current branch.
# Also, builds images for the Epic platform.
ci-trigger-build:
	curl \
		--request POST \
		-u ${CIRCLE_CI_TOKEN}: \
		--url https://circleci.com/api/v2/project/github/CitizenLabDotCo/citizenlab/pipeline \
		--header 'content-type: application/json' \
		--data "{\"branch\": \"$$(git branch --show-current)\",\"parameters\": {\"trigger\": false, \"back\": true, \"front\": true } }"

ci-run-e2e:
	curl \
		--request POST \
		-u ${CIRCLE_CI_TOKEN}: \
		--url https://circleci.com/api/v2/project/github/CitizenLabDotCo/citizenlab/pipeline \
		--header 'content-type: application/json' \
		--data "{\"branch\": \"$$(git branch --show-current)\",\"parameters\": {\"e2e\": true } }"
