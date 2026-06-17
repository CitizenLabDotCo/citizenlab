.PHONY: build reset-dev-env claude-setup configure-worktree migrate be-up be-up-debug be-up-fake-sso fe-up up up-fake-sso c rails-console rails-console-exec e2e-setup e2e-setup-and-up e2e-setup-and-up-fake-sso e2e-run-test e2e-ci-env-setup e2e-ci-env-setup-and-up e2e-ci-env-run-test ci-regenerate-templates ci-trigger-build ci-run-e2e release_pr

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
	# Best-effort: install the Claude private overlay if the dev has access. Fall through silently otherwise.
	-@bin/setup-claude || echo "Skipping Claude private overlay (no access or setup failed). Continuing."
	# -v removes volumes with all the data inside https://docs.docker.com/compose/reference/down/
	docker compose down -v || true # do not exit on error (some networks may be present, volumes may be used, which is often fine)
	make build
	# https://citizenlabco.slack.com/archives/C016C2EHURY/p1644234622002569
	docker compose run --rm web "bin/rails db:create && bin/rails db:reset"
	docker compose run --rm -e RAILS_ENV=test web bin/rails db:drop db:create db:schema:load

claude-setup:
	@bin/setup-claude

# For git worktrees: seed the gitignored *-secret.env files from the main checkout then run the Claude overlay setup
# Only works if the worktree is created in the same folder as the main checkout (../citizenlab)
configure-worktree:
	@for f in $$(cd ../citizenlab/env_files && ls *-secret.env 2>/dev/null); do \
		if [ ! -e env_files/$$f ]; then \
			cp ../citizenlab/env_files/$$f env_files/$$f && echo "Copied env_files/$$f from ../citizenlab"; \
		else \
			echo "Skipping env_files/$$f (already exists)"; \
		fi; \
	done
	@bin/setup-claude

migrate:
	docker compose run --rm web bin/rails db:migrate cl2back:clean_tenant_settings email_campaigns:assure_campaign_records fix_existing_tenants:update_permissions cl2back:clear_cache_store email_campaigns:remove_deprecated

be-up:
	docker compose up

be-up-debug:
	docker compose -f docker-compose.yml -f docker-compose.debug.yml up

fe-up:
	cd front && npm start

up:
	make -j 2 be-up fe-up

# Run stack with docker compose, including running npm inside of docker container
up-docker:
	docker compose --profile frontend up

# For testing different SSO methods using https in dev

# Generic
be-up-sso:
	docker compose down
	BASE_DEV_URI=https://sso.dev.govocal.com ASSET_HOST_URI=https://sso.dev.govocal.com docker compose up

fe-up-sso:
	cd front && npm run start:sso

# ACM (Itsme)
be-up-acm:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[acm]'
	BASE_DEV_URI=https://sso.dev.govocal.com ASSET_HOST_URI=https://sso.dev.govocal.com docker compose up

fe-up-acm:
	cd front && npm run start:sso

# Criipto
be-up-criipto:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[criipto]'
	docker compose up

fe-up-criipto:
	cd front && npm run start

# France connect
be-up-franceconnect:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[franceconnect]'
	BASE_DEV_URI=https://sso.dev.govocal.com ASSET_HOST_URI=https://sso.dev.govocal.com docker compose up

fe-up-franceconnect:
	cd front && npm run start:sso

# Brings the back-end stack up together with the fake_sso OIDC provider.
# Prerequisite: clone https://github.com/CitizenLabDotCo/fake_sso next to this
# repo (or set FAKE_SSO_PATH to its checkout) and add
# `127.0.0.1 host.docker.internal` to /etc/hosts.
be-up-fake-sso:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[fake_sso]'
	docker compose --profile fake_sso up

# Clave Unica
be-up-claveunica:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[clave_unica]'
	BASE_DEV_URI=https://claveunica-h2dkc.loca.lt ASSET_HOST_URI=https://claveunica-h2dkc.loca.lt docker compose up

fe-up-claveunica:
	cd front && npm run start:sso:claveunica

# MitID (via NemLogin)
be-up-nemlogin:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[nemlog_in]'
	BASE_DEV_URI=https://nemlogin-k3kd.loca.lt ASSET_HOST_URI=https://nemlogin-k3kd.loca.lt docker compose up

fe-up-nemlogin:
	cd front && npm run start:sso:nemlogin

# ID Austria
be-up-idaustria:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[id_austria]'
	BASE_DEV_URI=https://idaustria-g3fy.loca.lt ASSET_HOST_URI=https://idaustria-g3fy.loca.lt docker compose up

fe-up-idaustria:
	cd front && npm run start:sso:idaustria

# Keycloak (Oslo ID-Porten & Rheinbahn)
be-up-idporten:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[idporten]'
	BASE_DEV_URI=https://keycloak-r3tyu.loca.lt ASSET_HOST_URI=https://keycloak-r3tyu.loca.lt docker compose up

fe-up-idporten:
	cd front && npm run start:sso:idporten

# Note: Rheinbahn uses the same Keycloak setup as ID-Porten so verification config will need changing
be-up-rheinbahn:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[rheinbahn]'
	sudo sed -i '' 's/^#[[:space:]]*127\.0\.0\.1 demo\.stg\.govocal\.com$$/127.0.0.1 demo.stg.govocal.com/' /etc/hosts
	BASE_DEV_URI=https://demo.stg.govocal.com ASSET_HOST_URI=https://demo.stg.govocal.com docker compose up

fe-up-rheinbahn:
	cd front && npm run start:sso:rheinbahn

# Twoday (Helsingborg BankID & Freja eID)
be-up-twoday:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[twoday]'
	BASE_DEV_URI=https://twoday-h5jkg.loca.lt ASSET_HOST_URI=https://twoday-h5jkg.loca.lt docker compose up

fe-up-twoday:
	cd front && npm run start:sso:twoday

# Hoplr
be-up-hoplr:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[hoplr]'
	docker compose up

fe-up-hoplr:
	cd front && npm start

# Vienna
be-up-vienna:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[vienna_citizen,vienna_employee]'
	docker compose up

fe-up-vienna:
	cd front && npm start

# Federa (Modena SSO)
be-up-federa:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[federa]'
	sudo sed -i '' 's/^#[[:space:]]*127\.0\.0\.1 demo\.stg\.govocal\.com$$/127.0.0.1 demo.stg.govocal.com/' /etc/hosts
	BASE_DEV_URI=https://demo.stg.govocal.com ASSET_HOST_URI=https://demo.stg.govocal.com docker compose up

fe-up-federa:
	cd front && npm run start:sso:federa

# Google, Facebook
be-up-social-logins:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[google,facebook]'
	docker compose up

fe-up-social-logins:
	cd front && npm start

# Azure AD & Azure AD B2C.
be-up-azure:
	docker compose down
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[azureactivedirectory,azureactivedirectory_b2c]'
	docker compose up

fe-up-azure:
	cd front && npm start

# Reset any overrides to demo.stg.govocal.com in /etc/hosts that were added for sso local testing
sso-reset:
	docker compose run --rm web bundle exec rake 'dev:enable_id_method[fake_sso]'
	sudo sed -i '' 's/^127\.0\.0\.1 demo\.stg\.govocal\.com$$/# 127.0.0.1 demo.stg.govocal.com/' /etc/hosts

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
	docker compose run --rm web bin/rspec $(patsubst back/%,%,${file})

# SSH session onto the running web container.
bash-exec:
	docker exec -it cl-back-web /bin/bash

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
