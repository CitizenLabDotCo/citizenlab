.PHONY: build reset-dev-env migrate be-up fe-up up c rails-console rails-console-exec e2e-setup e2e-setup-and-up e2e-run-test e2e-ci-env-setup e2e-ci-env-setup-and-up e2e-ci-env-run-test ci-regenerate-templates ci-trigger-build ci-run-e2e

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

# search_path=localhost specifies the schema of localhost tenant
psql:
	docker-compose run -it -e PGPASSWORD=postgres -e PGOPTIONS="--search_path=localhost" postgres psql -U postgres -h postgres -d cl2_back_development

# Run it with:
# make add-campaign-and-notification source=initiative_resubmitted_for_review target=new_cosponsor_added
# See back/bin/add_campaign_and_notification for details.
add-campaign-and-notification:
	back/bin/add_campaign_and_notification ${source} ${target}

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
# make e2e-run-test spec=cypress/e2e/about_page.cy.ts
# # or specify an entire folder
# make e2e-run-test spec=cypress/e2e/project_description_builder/sections
e2e-run-test:
	cd front && \
	npm run cypress:run -- --config baseUrl=http://localhost:3000 --spec ${spec}

# -----------------
# The following e2e commands use the "ci-env" prefix which means
# that the used environment will be very similar to CI (the same docker-compose.yml file)
# -----------------

e2e-ci-env-setup:
	cd e2e && \
	docker-compose build && \
	docker-compose run web bin/rails db:drop db:create db:schema:load && \
	docker-compose run web bin/rails "cl2_back:create_tenant[e2e.front,e2etests_template]"

e2e-ci-env-up:
	# we need --build because volumes are not used by default https://www.notion.so/citizenlab/Testing-253d0c3cd99841a59929f7f615179935?pvs=4#f088eb9d2c304af59d5d5d2ede6e4439
	cd e2e && docker-compose up --build

e2e-ci-env-setup-and-up:
	make e2e-ci-env-setup
	make e2e-ci-env-up

# Run it with:
# make e2e-ci-env-run-test spec=cypress/e2e/about_page.cy.ts
# # or specify an entire folder
# make e2e-ci-env-run-test spec=cypress/e2e/project_description_builder/sections
e2e-ci-env-run-test:
	cd e2e && \
	docker-compose run --rm --name cypress_run front npm run cypress:run -- --config baseUrl=http://e2e.front:3000 --spec ${spec}

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
ci-build:
	curl \
		--request POST \
		-u ${CIRCLE_CI_TOKEN}: \
		--url https://circleci.com/api/v2/project/github/CitizenLabDotCo/citizenlab/pipeline \
		--header 'content-type: application/json' \
		--data "{\"branch\": \"$$(git branch --show-current)\",\"parameters\": {\"trigger\": false, \"back\": true, \"front\": true } }"

ci-e2e:
	curl \
		--request POST \
		-u ${CIRCLE_CI_TOKEN}: \
		--url https://circleci.com/api/v2/project/github/CitizenLabDotCo/citizenlab/pipeline \
		--header 'content-type: application/json' \
		--data "{\"branch\": \"$$(git branch --show-current)\",\"parameters\": {\"e2e\": true } }"
	$(info You can check the status of the build here: https://app.circleci.com/pipelines/github/CitizenLabDotCo/citizenlab)
