# inspired by ParticipationPermissionsService
class ReportBuilder::PermissionsService
  EDITING_DISABLED_REASONS = {
    report_has_unauthorized_data: 'report_has_unauthorized_data'
  }.freeze

  def editing_disabled_reason_for_report(report, current_user)
    if report_has_unauthorized_data?(report, current_user)
      EDITING_DISABLED_REASONS[:report_has_unauthorized_data]
    end
  end
end
