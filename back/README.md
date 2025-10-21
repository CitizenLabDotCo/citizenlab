# cl2-back

## Getting started

First, you need the latest docker and docker-compose installed.

Build the docker compose images and populate the database:
```
make reset-dev-env
```

## Executing commands

You can execute commands as if they were running on your local machine, by prepending them with `docker-compose run --user "$(id -u):$(id -g)" --rm web `

Sometimes it's easier to just start a terminal in the rails container and work from there:
```
docker-compose run --user "$(id -u):$(id -g)" --rm web /bin/bash
```

Mac or Windows:
```
docker-compose run --rm web /bin/bash
```

## Handling update

After a git pull, when there are changes in the application, some changes might affect the database model or update the seed data.

This is a fail-safe step process you can apply to handle any update:

```bash
docker-compose down
docker-compose build web
docker-compose run --rm web bundle exec rake db:reset
docker-compose up
```

On Linux, you need to add `--user "$(id -u):$(id -g)"` to all `docker-compose run` commands. This is not required on Mac or Windows.

The 3rd step is not always required. It is needed when

- The database structure has changed, indicated by an update to `db/schema.rb`
- The test data, aka seed data, has changed, indicated by an update to `db/seeds.rb`

Alternatively, there is a convenience script to reset the whole environment for you.
```
make reset-dev-env
```

## Testing

### Unit and integration tests
To run the tests:

- If you're on Linux, use this command:
  ```bash
  docker-compose run --rm --user "$(id -u):$(id -g)" web rspec
  ```

- If you're on Mac or Windows, run:
  ```bash
  docker-compose run --rm web rspec
  ```

For debugging random test failures, it's can be useful to run the tests multiple times, but stop as soon as one of the test runs fails (for Mac or Windows):

```
for i in `seq 50`; do docker-compose run --rm web rspec ./spec/acceptance/pages_spec.rb; [[ ! $? = 0 ]] && break ; done
```

### End-to-end tests

The e2e tests themselves are defined in cl2-front. But they take some assumptions on the available data on the platform, so they can depend on some projects, ideas, users, ... to be there.

This data is defined in `config/tenant_templates/e2etests_template.yml`. The tenant settings are defined in `lib/tasks/create_tenant.rake`.

To (re)load the data and run the e2e tests locally, execute the following command:

```
make e2e-setup
```

### Rubocop

As part of our OS efforts, we are using rubocop as a linter for our ruby code.

### Running rubocop

For a complete list of commands, [see docs here](https://docs.rubocop.org/rubocop/usage/basic_usage.html).

```zsh
# default
rubocop

# running rubocop on modified files only
git diff --name-only --diff-filter=MA | xargs rubocop

# autofixing the files you modified
git diff --name-only --diff-filter=MA | xargs rubocop -a
```


### Instructions for VsCode

**Option 1** - Install ruby on your machine, the `rubocop` gems and the **rubocop vscode extension** (this can take up to a few hours if you don't have ruby installed locally but it's the best option for me).

```
gem install rubocop rubocop-rspec rubocop-i18n rubocop-performance rubocop-rails rubocop-require_tools
code --install-extension misogi.ruby-rubocop
```

**Option 2** - Give VSCode access to your contained environment.

1. Install the extension `Remote Containers` if you don't have yet.
2. You should now get prompted with something like this:
![Screenshot 2020-12-18 at 17 37 09](https://user-images.githubusercontent.com/24591228/102638438-c3ed4880-4157-11eb-88f5-4ab41c868562.png)
3. Click, wait a few minutes for the containers to build and voila! Rubocop should be running in your local environment.


## Using Customized Tenants for Development

In order to have more fake data in your localhost tenant, set the `SEED_SIZE` environment variable in `.env` to `small`, `medium`, `large` or `empty`. Defaults to medium. Then, run `rake db:reset`.

If you would like to access another tenant than the `localhost` tenant, created through e.d. cl2-admin, you can set the `OVERRIDE_HOST` environment variable in `.env` prior to starting the container. This makes cl2-back believe that all requests are coming from that tenants host, letting you access the tenant at localhost:3000 through cl2-front.

NOTE: Watch out that you don't accidentally commit these changes!


## Using S3 storage in development

Set `USE_AWS_S3_IN_DEV=true` in `env_files/back-safe.env`.


## Creating Engines

In this section, we explain what you need to do (and what you shouldn't forget) when adding a new engine to `citizenlab/back`. Throughout these instructions, replace "`blorgh`" by the name of your engine. These instructions are for adding free engines (Go Vocal employees can find the instructions for commercial engines in Notion).

1. Run `docker-compose run web bin/rails plugin new engines/free/blorgh --mountable`. Initialize your engine with a nice `README` file.

2. Remove files/folders you don’t need. Change the current files to correspond with the other engines.

3. In the `blorgh.gemspec` file, make sure `CitizenLab Commercial License V2` is specified as license.

4. For feature engines (represented by an app configuration setting that can be enabled and disabled), copy over `lib/blorgh/feature_specification.rb` and `spec/lib/settings_spec.rb` and edit according to your engine's specifications.

5. Add the new engine to the `Gemfile`

6. Update the licenses by executing `license_finder approvals add blorgh`.

7. A good way to verify if your engine was added successfully is by running the `spec/lib/settings_spec.rb` spec.


## Running the profiler

1. Run the backend.
2. Execute the requests you want to profile.
3. Go to http://localhost:4000/rack-mini-profiler/requests.


## Finding back JSON-formatted events from RabbitMQ

1. Run the backend

2. Navigate to `http://localhost:8088` -> `Admin` -> `Tracing`. Log in with `guest`, `guest`.

3. Add a new trace in TEXT (not JSON) format

4. Generate the desired events

5. Click on the trace log file you created on `http://localhost:8088` to see the events


## Disabling Bootsnap

Uncomment `require 'bootsnap/setup'` in `config/boot.rb`


## Troubleshooting

### Rails generate commands result in uninitialized constant errors

This issue was introduced since we're using Zeitwerk for autoloading and remains unresolved. Commenting `config.eager_load = true` in development.rb will allow you to run the command.

## Fixing N+1 Queries

### How to
To check for n+1 queries, a developer will have to **proactively check** the `log/bullet.log` file, which is in `.gitignore` as of now, and solve issue by issue. Issues are very self explanatory and look something like this:

```log
2020-10-14 21:55:54[WARN] user: root
GET /web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random&project_publication_status=published
USE eager loading detected
  Project => [:admin_publication]
  Add to your query: .includes([:admin_publication])
Call stack
  /citizenlab/back/app/services/participation_context_service.rb:67:in `get_participation_context'
  /citizenlab/back/app/services/participation_context_service.rb:120:in `commenting_disabled_reason_for_idea'
  /citizenlab/back/app/serializers/web_api/v1/idea_serializer.rb:11:in `block in <class:IdeaSerializer>'
  /citizenlab/back/app/controllers/application_controller.rb:82:in `linked_json'
  /citizenlab/back/app/controllers/web_api/v1/ideas_controller.rb:78:in `index'
  /citizenlab/back/config/initializers/apartment.rb:91:in `block in call'
  /citizenlab/back/config/initializers/apartment.rb:91:in `call'
```

Following the callstack, you will be able to understand that extra queries are being performed to retrieve the `admin_publication` in the `participation_context_service.rb` of each idea of the` Ideas#index` action. (adding `:admin_publication` to the includes args would fix it)

### Testing (not enabled by default)

The second alternative is to switch:

```ruby
# config/application.rb
Bullet.raise = true
```

And add the gem a `:testing` group as well, it will then fail tests when errors occur.

### In case an issue should be ignored (e.g. some gems)
Add it to the `Bullet.stacktrace_excludes = []` blacklist in `config/application.rb`

## Dependency license management

We use [license_finder](https://github.com/pivotal/LicenseFinder) to check whether the licenses of our gems are compatible with our own. CI runs it for you.

When you add a gem, you don't have to do anything if it comes with a license we previously approved. If it is a new license, you can use the license_finder CLI to approve the license, also for future dependencies.
```bash
docker-compose run web license_finder permitted_licenses add "the license name"
```
If the license is unknown to rubygems, you can directly approve a gem.
```bash
docker-compose run web license_finder approvals add some_awesome_new_gem
```
Only approve a license or gem if you're sure there are no compatibility issues. License_finder stores its information in `doc/dependency_decisions.yml`
