# frozen_string_literal: true

# Forwards rows captured by the admin_publication deletion-audit trigger
# (see migration 20260703120000_create_admin_publication_deletion_audit) to
# Sentry, so a capture becomes an alert instead of sitting unnoticed in a
# per-tenant table.
#
# Idempotent: only unreported rows are pushed, and each is stamped with
# `reported_at` once forwarded, so re-runs never double-report. A missed run is
# simply picked up by the next one. Meant to be invoked periodically (e.g. the
# `admin_publications:report_orphans` rake task, from the infra scheduler).
class ReportOrphanedAdminPublicationsJob < ApplicationJob
  self.priority = 70 # low priority: diagnostics, never user-facing

  def perform
    Tenant.safe_switch_each do |tenant|
      report_tenant(tenant)
    end
  end

  private

  def report_tenant(tenant)
    # The table exists in every schema after the migration; guard anyway so a
    # single odd schema can't abort the whole sweep.
    return unless AdminPublicationDeletionAudit.table_exists?

    AdminPublicationDeletionAudit.unreported.find_each do |audit|
      ErrorReporter.report_msg(
        "Orphaned admin_publication captured on #{tenant.host}: " \
        "#{audit.publication_type} #{audit.publication_id} lost its admin_publication",
        extra: audit_context(tenant, audit)
      )
      audit.update_column(:reported_at, Time.current)
    end
  rescue StandardError => e
    # One bad tenant must not stop the sweep across the others.
    ErrorReporter.report(e)
  end

  def audit_context(tenant, audit)
    {
      tenant_host: tenant.host,
      tenant_schema: audit.tenant_schema,
      audit_id: audit.id,
      admin_publication_id: audit.admin_publication_id,
      publication_id: audit.publication_id,
      publication_type: audit.publication_type,
      parent_id: audit.parent_id,
      was_in_folder: !audit.parent_id.nil?,
      lft: audit.lft,
      rgt: audit.rgt,
      publication_status: audit.publication_status,
      deleted_at: audit.deleted_at,
      db_user: audit.db_user,
      application_name: audit.application_name,
      client_addr: audit.client_addr,
      backend_pid: audit.backend_pid,
      transaction_id: audit.transaction_id
    }
  end
end
