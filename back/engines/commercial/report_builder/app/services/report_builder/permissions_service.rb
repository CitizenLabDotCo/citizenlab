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

  private

  def report_has_unauthorized_data?(report, current_user)
    return false if current_user.admin?
    return true if current_user.normal_user?

    project_ids = UserRoleService.new.moderatable_projects(current_user).ids

    report.layout.craftjs_json.each do |_node_id, node_obj|
      type = node_obj['type']
      resolved_name = type.is_a?(Hash) ? type['resolvedName'] : next
      next unless ReportBuilder::QueryRepository::GRAPH_RESOLVED_NAMES_CLASSES.key?(resolved_name)

      props = node_obj['props']

      phase_id = props['phaseId']
      if phase_id.present?
        phase = Phase.find(phase_id)

        if project_ids.exclude?(phase.project_id)
          return true
        end
      elsif props['projectId'].blank? || project_ids.exclude?(props['projectId'])
        return true
      end
    end

    false
  end
end
