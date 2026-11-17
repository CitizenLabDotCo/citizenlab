# frozen_string_literal: true

# Loaded by annotaterb before it annotates the models (see .annotaterb.yml). Some models compute
# attribute defaults from the app configuration, which only exists inside a tenant, so annotate
# inside one. All tenant schemas share the same structure.
tenant = Tenant.not_deleted.first
Apartment::Tenant.switch!(tenant.schema_name) if tenant
