# frozen_string_literal: true

namespace :single_use do
  # Phase permissions used to be created eagerly for every supported action.
  # They are now only created when an admin overrides the action; until then it
  # follows the global 'visiting' permission.
  #
  # This deletes the phase permissions that are already an exact copy of their
  # tenant's 'visiting' permission, so those actions go back to inheriting.
  # Anything that differs in any way is left alone, so no behaviour changes.
  #
  # Run with REPORT=true first to see the counts without deleting anything.
  task delete_inherited_phase_permissions: :environment do
    report_only = ENV['REPORT'] == 'true'
    totals = { deleted: 0, kept: 0 }

    Tenant.safe_switch_each do |tenant|
      service = Permissions::PermissionInheritanceService.new
      Permissions::PermissionInheritanceService.clear_source_permission_cache

      permissions = Permission.where(permission_scope_type: 'Phase')
        .includes(:groups, :permissions_custom_fields, :permission_scope)

      deletable, kept = permissions.partition { |permission| service.matches_source?(permission) }

      totals[:deleted] += deletable.size
      totals[:kept] += kept.size
      Rails.logger.info "#{tenant.host}: #{deletable.size} phase permissions match 'visiting', #{kept.size} customised"

      next if report_only || deletable.empty?

      deletable.each(&:destroy!)
    end

    verb = report_only ? 'would be deleted' : 'deleted'
    Rails.logger.info "Total: #{totals[:deleted]} phase permissions #{verb}, #{totals[:kept]} kept"
  end
end
