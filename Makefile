.PHONY: build reset-dev-env migrate be-up fe-up up c rails-console rails-console-exec e2e-setup e2e-setup-and-up e2e-run-test e2e-ci-env-setup e2e-ci-env-setup-and-up e2e-ci-env-run-test ci-regenerate-templates ci-trigger-build ci-run-e2e release_pr

# You can run this file with `make` command:
# make reset-dev-env
# make up

# All commands from this file should work in bash too after:
# 1. replacing $$ with $
# 2. replacing variables in ${} with some values, so `-u ${CIRCLE_CI_TOKEN}:` becomes `-u XXX:`

release_pr:
	@./scripts/create_release_pr.sh

# =================
# Dev env
# =================

build:
	docker compose build
	cd front && npm install

reset-dev-env:
	# -v removes volumes with all the data inside https://docs.docker.com/compose/reference/down/
	docker compose down -v || true # do not exit on error (some networks may be present, volumes may be used, which is often fine)
	make build
	# https://citizenlabco.slack.com/archives/C016C2EHURY/p1644234622002569
	docker compose run --rm web "bin/rails db:create && bin/rails db:reset"
	docker compose run --rm -e RAILS_ENV=test web bin/rails db:drop db:create db:schema:load

migrate:
	docker compose run --rm web bin/rails db:migrate cl2back:clean_tenant_settings email_campaigns:assure_campaign_records fix_existing_tenants:update_permissions cl2back:clear_cache_store email_campaigns:remove_deprecated

be-up:
	docker compose up

fe-up:
	cd front && npm start

up:
	make -j 2 be-up fe-up

# For testing different SSO methods
be-up-claveunica:
	docker compose down
	BASE_DEV_URI=https://claveunica-h2dkc.loca.lt docker compose up -d
	lt --print-requests --port 3000 --subdomain claveunica-h2dkc

be-up-nemlogin:
	docker compose down
	BASE_DEV_URI=https://nemlogin-k3kd.loca.lt docker compose up -d
	lt --print-requests --port 3000 --subdomain nemlogin-k3kd

be-up-idaustria:
	docker compose down
	BASE_DEV_URI=https://idaustria-g3fy.loca.lt docker compose up -d
	lt --print-requests --port 3000 --subdomain idaustria-g3fy

be-up-keycloak:
	docker compose down
	BASE_DEV_URI=https://keycloak-r3tyu.loca.lt docker compose up -d
	lt --print-requests --port 3000 --subdomain keycloak-r3tyu

be-up-twoday:
	docker compose down
	BASE_DEV_URI=https://twoday-h5jkg.loca.lt docker compose up -d
	lt --print-requests --port 3000 --subdomain twoday-h5jkg

# Run it with:
# make c
# # or
# make rails-console
c rails-console:
	docker compose run --rm web bin/rails c

# Runs rails console in an existing web container. May be useful if you need to access localhost:4000 in the console.
# E.g., this command works in this console `curl http://localhost:4000`
rails-console-exec:
	docker exec -it "$$(docker ps | awk '/cl-back-web/ {print $$1}' | head -1)" bin/rails c

# search_path=localhost specifies the schema of localhost tenant
psql:
	docker compose run -it -e PGPASSWORD=postgres -e PGOPTIONS="--search_path=localhost" postgres psql -U postgres -h postgres -d cl2_back_development

# Run it with:
# make copy-paste-code-entity source=initiative_resubmitted_for_review target=new_cosponsor_added
# See back/bin/copy_paste_code_entity for details.
copy-paste-code-entity:
	back/bin/copy_paste_code_entity ${source} ${target}

blint back-lint-autocorrect:
	docker compose run web bundle exec rubocop -P --format simple --autocorrect

# Usage example:
# make r file=spec/models/idea_spec.rb
r rspec:
	docker compose run --rm web bin/rspec ${file}

# Usage examples:
# make feature-flag feature=initiative_cosponsors enabled=true
# make feature-flag feature=initiative_cosponsors allowed=false enabled=false
feature-flag:
	docker compose run web "bin/rails runner \"Tenant.find_by(host: 'localhost').switch!; \
	c = AppConfiguration.instance; \
	c.settings['${feature}'] ||= {}; \
	${if ${enabled},c.settings['${feature}']['enabled'] = ${enabled};,} \
	${if ${allowed},c.settings['${feature}']['allowed'] = ${allowed};,} \
	c.save!\""

# Shorthand command (alias for feature-flag)
# Usage example:
# make ff f=initiative_cosponsors e=false
ff:
	@${MAKE} feature-flag feature=${f} enabled=${e} allowed=${a}

# =================
# E2E tests
# =================
#
# https://www.notion.so/citizenlab/Testing-253d0c3cd99841a59929f7f615179935?pvs=4#6a0fc23d220c4afeb90bbd0cb7dbc0f5

# After running this command, start the dev servers as usual (make up)
e2e-setup:
	make build
	docker compose run --rm web bin/rails db:drop db:create db:schema:load
	docker compose run --rm web bin/rails cl2_back:create_tenant[localhost,e2etests_template]

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
		--data '{"branch": "production", "parameters": {"templates": true, "trigger": false }}'

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
