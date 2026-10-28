# frozen_string_literal: true

# This migration comes from multi_tenancy (originally 20261028120000)
class AddTemplateApplicationStartedAtToTenants < ActiveRecord::Migration[7.2]
  # Marks that ApplyTenantTemplateJob started on a tenant, so that a re-run of an
  # interrupted job (worker restarted mid-apply) can fail instead of applying the
  # template a second time on top of the half-built tenant.
  def change
    add_column :tenants, :template_application_started_at, :datetime, null: true, default: nil
  end
end
