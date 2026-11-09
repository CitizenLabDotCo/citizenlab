# inspired by BasePermissionsService - But has no need to inherit from it
class ReportBuilder::Permissions::ReportPermissionsService
  EDITING_DENIED_REASONS = {
    report_has_unauthorized_data: 'report_has_unauthorized_data'
  }.freeze

  def editing_disabled_reason_for_report(report, current_user)
    if report_has_unauthorized_data?(report, current_user)
      EDITING_DENIED_REASONS[:report_has_unauthorized_data]
    end
  end

  def action_descriptors(report, user)
    editing_disabled_reason = editing_disabled_reason_for_report(report, user)
    {
      editing_report: {
        enabled: !editing_disabled_reason,
        disabled_reason: editing_disabled_reason
      }
    }
  end

  private

  def report_has_unauthorized_data?(report, current_user)
    return false if current_user.admin?
    return true if current_user.normal_user?

    project_ids = UserRoleService.new.moderatable_projects(current_user).ids

    report.layout.craftjs_json.each_value do |node_obj|
      type = node_obj['type']
      resolved_name = type.is_a?(Hash) ? type['resolvedName'] : next
      next unless ReportBuilder::QueryRepository::GRAPH_RESOLVED_NAMES_CLASSES.key?(resolved_name)

      props = ReportBuilder::QueryRepository.normalize_props(node_obj['props'])
      phase_id = props['phase_id']
      project_id = props['project_id']

      # A widget whose phase was deleted falls back to its project.
      # see this discussion for details
      # https://github.com/CitizenLabDotCo/citizenlab/pull/6910/files#r1474778771
      phase = phase_id.present? ? Phase.find_by(id: phase_id) : nil

      return true if phase.nil? && project_id.blank?
      return true if phase && project_ids.exclude?(phase.project_id)
      # Each query reads only the ids it needs, so an id nobody checks is a way
      # into another project's data.
      return true if project_id.present? && project_ids.exclude?(project_id)
    end

    false
  end
end
