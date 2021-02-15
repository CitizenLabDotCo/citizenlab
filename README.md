# cl2-back

# Getting started

First you have the latest docker and docker-compose installed.

Build the docker compose images
```
docker-compose up --build -d
```
Some containers will fail, because the database is not setup yet.
On the first run, use these commands to create the database and populate it with some dummy data:

```
docker-compose run --user "$(id -u):$(id -g)" web bundle exec rake db:create

docker-compose run --user "$(id -u):$(id -g)" web bundle exec rake db:reset
```

Mac or Windows:

```
docker-compose run web bundle exec rake db:create

docker-compose run web bundle exec rake db:reset
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

To save some time, often it is not necessary to run the 2nd time consuming command `docker-compose build web`. This is only required when libraries have been updated, indicated by a change in the `Gemfile.lock` file.

The 3rd step is also not always required. It is needed when

- The database structure has changed, indicated by an update to `db/schema.rb`
- The test data, aka seed data, has changed, indicated by an update to `db/seeds.rb`

## Testing

### Unit and integration tests
Resetting the database, with the previous command, upsets the testing database as well. Before running the tests, it's sometimes necessary to put it back in it's default shape. We can do this with the following command:

```
docker-compose run --rm --user "$(id -u):$(id -g)" -e RAILS_ENV=test web rake db:environment:set db:drop db:create db:schema:load
```

Mac or Windows:

```
docker-compose run --rm -e RAILS_ENV=test web rake db:environment:set db:drop db:create db:schema:load
```

To actually run the tests:
```
docker-compose run --rm --user "$(id -u):$(id -g)" web rspec

```

Mac or Windows:

```
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
docker-compose run --rm web bundle exec rake cl2_back:create_tenant[localhost,e2etests_template]
```

### Rubocop

As part of our OS efforts, we are using rubocop as a linter for our ruby code.

### Running rubocop

For a complete list of commands, [see docs here](https://docs.rubocop.org/rubocop/usage/basic_usage.html).

```zsh
# default
rubocop

# in different output formats
rubocop --format simple

# with safe autocorrect
rubocop -a

# with unsafe autocorrect
rubocop -A

# for specific rules
rubocop --only Rails/Blank,Layout/HeredocIndentation,Naming/FileName

# for specific files or directories. Files to always be ignored should be added in rubocop.yml
rubocop app spec lib/something.rb

# running rubocop on modified files only
git diff --name-only --diff-filter=MA | xargs rubocop

# autofixing the files you modified
git diff --name-only --diff-filter=MA | xargs rubocop -a
```


### Enabling/Disabling Cops
Everything is configured in the `.rubocop.yml` file. Here's the first version.

```yaml
require:
  - rubocop-rails
  - rubocop-performance
  - rubocop-rspec

AllCops:
  NewCops: enable
  Exclude:
  - 'db/schema.rb'
  # add other auto-generated ruby files here.
Metrics/BlockLength:
  Enabled: true
  Exclude:
    - 'spec/**/*'
    - 'db/migrate/**/*'
  # Max: 25
Metrics/MethodLength:
  Enabled: true
  Exclude:
    - 'db/migrate/**/*'
  # Max: 10
Metrics/ClassLength:
  Enabled: true
  # Max: 100
Layout/LineLength:
  Enabled: true
  # Max: 120
Rails/LexicallyScopedActionFilter:
  Enabled: true
Style/Documentation:
  Enabled: true
  Exclude:
    - 'db/migrate/**/*'
Style/ClassAndModuleChildren:
  Enabled: false
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


### Adding a CI check

```yml
  rubocop:
    resource_class: small
    executor:
      name: cl2-back
      image-tag: $CIRCLE_SHA1
    working_directory: /cl2_back
    parallelism: 4
    environment:
      RAILS_ENV: test
    steps:
      - checkout:
          path: /tmp/cl2-back
      - run: |
          rubocop --format simple --parallel
```


## Using Customized Tenants for Development

In order to have more fake data in your localhost tenant, set the `SEED_SIZE` environment variable in `.env` to `small`, `medium`, `large` or `empty`. Defaults to medium. Then, run `rake db:reset`.

If you would like to access another tenant than the `localhost` tenant, created through e.d. cl2-admin, you can set the `OVERRIDE_HOST` environment variable in `.env` prior to starting the container. This makes cl2-back believe that all requests are coming from that tenants host, letting you access the tenant at localhost:3000 through cl2-front.

NOTE: Watch out that you don't accidently commit these changes!


## Using S3 storage in development

1. Go to desired image and/or file uploader.

2. Always include `storage :fog` (comment out if-condition).

3. Comment out `asset_host` method (use original implementation from Carrierwave)


## Creating Engines

In this section, we explain what you need to do (and what you shouldn't forget) when adding a new engine to `cl2-back`. Throughout these instructions, replace "`blorgh`" by the name of your engine.

1. Create a new folder in the `engines` folder and initialize it with an empty `app` folder. Initialize your engine with a nice `README` file.

2. Copy the `bin` folder from another engine (no renamings required).

3. Create a `config` folder with a `config/routes.rb` file initialized as:
```
Blorgh::Engine.routes.draw do

end
```

4. Create a `db` folder and in it an empty `migrate` folder.

5. Create a `lib` folder with an empty `tasks` folder. Copy the `blorgh` folder (with `engine.rb` and `version.rb`) and `blorgh.rb` from another engine and do the necessary renamings in the copied files.

6. Copy over `blorgh.gemspec` and rename (no need to include `MIT-LICENSE` or `Rakefile`), remove/add dependencies if you know what you're doing.

7. Add the following line to your `Gemfile`:
```
gem 'blorgh', path: 'engines/blorgh'
```

8. If you're going to add endpoints to your engine, don't forget to mount it in the main `routes.rb` file.

9. If you added a factory into your engine, you have to add this line to `spec_helper.rb`:
```
require './engines/blorgh/spec/factories/blorghs.rb'
```

10. If you added a gem to `blorgh.gemspec`, you'll also need to `require` it in `lib/blorgh.rb`.

11. If some of your engine's models have relationships with models outside the engine, don't forget to add e.g. `has_many` dependencies in decorator files in you engine's `model` folder.


## Adding smart group rules

1. Create your smart group rule in `lib/smart_group_rules`.

2. Add your new rule to `RULE_TYPE_TO_CLASS` in `app/services/smart_groups_service.rb`.

3. Add a spec to `spec/lib/smart_group_rules/`.

4. Add your rule to `spec/models/group_spec.rb`.

5. Add rule descriptions by overriding `description_value`, `description_rule_type` and `description_property` as desired, and by adding translations under the `smart_group_rules` key.

6. Add specs for the rule descriptions in the spec file you created in `spec/lib/smart_group_rules/`.

7. Create a frontend task to support the new smart groups rule.


## Running the profiler

1. Run the backend

2. Execute the requests you want to profile

3. Go to http://localhost:4000/profiler.html?pp=normal-backtrace


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
  /cl2_back/app/services/participation_context_service.rb:67:in `get_participation_context'
  /cl2_back/app/services/participation_context_service.rb:120:in `commenting_disabled_reason_for_idea'
  /cl2_back/app/serializers/web_api/v1/idea_serializer.rb:11:in `block in <class:IdeaSerializer>'
  /cl2_back/app/controllers/application_controller.rb:82:in `linked_json'
  /cl2_back/app/controllers/web_api/v1/ideas_controller.rb:78:in `index'
  /cl2_back/config/initializers/apartment.rb:91:in `block in call'
  /cl2_back/config/initializers/apartment.rb:91:in `call'
```

Following the callstack, you will be able to understand that extra queries are being performed to retrieve the `admin_publication` in the `participation_context_service.rb` of each idea of the` Ideas#index` action. (adding `:admin_publication` to the includes args would fix it)

### Testing (not enabled by default)

The second alternative is to switch:

````ruby
# config/application.rb
Bullet.raise = true
```

And add the gem a `:testing` group as well, it will then fail tests when errors occur.

### In case an issue should be ignored (e.g. some gems)
Add it to the `Bullet.stacktrace_excludes = []` blacklist in `config/application.rb`
