# frozen_string_literal: true

# Rows are normally written by the `audit_orphaned_admin_publication` DB trigger,
# never by the app. This factory only exists to fabricate rows for testing the
# model scopes and the forwarder job.
FactoryBot.define do
  factory :admin_publication_deletion_audit do
    admin_publication_id { SecureRandom.uuid }
    publication_id { SecureRandom.uuid }
    publication_type { 'Project' }
    tenant_schema { 'example_org' }
    tenant_host { 'example.org' }
    publication_status { 'published' }
    deleted_at { Time.zone.now }
    application_name { 'bin/rails' }
    reported_at { nil }
  end
end
