# Analytics
New analytics engine

## IMPORTANT: Iteration 1

The instructions below this section apply only to the multi-database set-up which will not be deployed until 
later iterations. Until then, this engine can be used as any other by:

1. Add the following to citizenlab.config.ee.json:

`"commercial/analytics": true`

2. Copying migrations (and views) to the main codebase using:

`rails analytics:install:migrations`

## How to run the additional required docker container

To run docker with analytics enabled

`docker-compose --profile analytics up -d`

## Installation

1. Run this when you first install the application:

```
docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "psql -h localhost -U postgres -c 'CREATE DATABASE cl2_analytics;'"
```

2. To sync data from your main DB to the analytics DB run the following command

```
docker exec -it -e PGPASSWORD=postgres cl-postgres-analytics /bin/bash -c "pg_dump --clean -h postgres -U postgres cl2_back_development | psql -h localhost -U postgres cl2_analytics"
```

3. TRUNCATE the localhost.schema_migrations table in your analytics DB

4. Add the following to citizenlab.config.ee.json:

`"commercial/analytics": true`

5. Docker Rebuild required?

## Database

There is a secondary database connection set up to cl_back_analytics - however it currently is ignoring appartment and
only using a single schema. There is currently a setting in the DB config to make it use 'localhost' so we can develop
on our default localhost tenant.

## Running migrations:

### Important

Views cannot be read directly from the engine folder,
so rake migration tasks have been extended to copy the views to the main codebase before running migrations.
All sql files starting with analytics_ in the main codebase are therefore excluded from git using .gitignore.
Migrations can be run just for this engine using:

```
rails db:migrate:analytics
```

To rollback:

```
rails db:rollback:analytics
```

### Naming

Views/tables should be named as follows:

* analytics_dimension_*
* analytics_fact_*

