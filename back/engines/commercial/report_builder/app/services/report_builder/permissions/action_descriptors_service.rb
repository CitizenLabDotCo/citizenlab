# frozen_string_literal: true

class ReportBuilder::Permissions::ActionDescriptorsService
  def initialize
    @permissions_service = ReportBuilder::Permissions::PermissionsService.new
  end

  def report_builder_action_descriptor(report, user)
    editing_disabled_reason = @permissions_service.editing_disabled_reason_for_report(report, user)
    {
      editing_report: {
        enabled: !editing_disabled_reason,
        disabled_reason: editing_disabled_reason
      }
    }
  end
end
