# COPY tenants script

## In three parts

This script is divided into three parts:

1. Dump the schema of the source tenant and replace all the UUIDs with new ones.
```docker compose run --rm web ruby scripts/dump_schema.rb localhost```

2. Import the modified schema into a new tenant.
```docker compose run --rm web ruby scripts/import_schema.rb onemore_tenant scripts/dumps/localhost_schema_20251207_140355.sql```

3. Copy all S3 resources to new names using the UUID mapping file generated in step 1.
``` docker compose run --rm web ruby scripts/copy_s3_resources.rb c72c5211-8e03-470b-9564-04ec0a8c322b 9965b54f-10de-4f7e-bd3b-2d9c9e61b4e9 scripts/dumps/localhost_schema_20251207_140355_uuid_mapping.json```

TODO: AWS resources are returning Access Denied errors locally, need to investigate further.
