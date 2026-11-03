# frozen_string_literal: true

class McpServer::Tools::ListPhasePermissions < McpServer::BaseTool
  def name = 'list_phase_permissions'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Lists the permissions of a phase (one per applicable action, e.g. posting_idea, voting).
      There is no create tool. An action the phase has not customised is reported with
      inherited: true, along with the platform-wide sign-in settings it follows; updating it
      with update_phase_permission gives the phase settings of its own.
      Call before update_phase_permission to see which actions exist.
    DESC
  end

  def input_schema
    {
      properties: {
        phase_id: { type: 'string' }
      },
      required: %w[phase_id]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase

      # Mixes the permissions the phase owns with the ones it inherits from the
      # global 'visiting' permission, in the phase's action order.
      # See Permissions::PermissionInheritanceService.
      permissions = Permissions::PermissionInheritanceService.new
        .effective_permissions(phase)
        .map { |permission| McpServer::Serializers::Permission.serialize(permission) }

      response(
        "Found #{permissions.size} permission(s) on phase #{phase.id}",
        structured: { phase_id: phase.id, permissions: permissions }
      )
    end
  end
end
