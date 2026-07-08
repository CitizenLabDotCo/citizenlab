# frozen_string_literal: true

class McpServer::Tools::ListPhasePermissions < McpServer::BaseTool
  def name = 'list_phase_permissions'
  def annotations = READ_ANNOTATIONS

  def description
    <<~DESC.squish
      Lists the permissions of a phase (one per applicable action, e.g. posting_idea, voting).
      Permissions are auto-created with the phase — there is no create tool.
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
      phase = Phase.find(params[:phase_id])

      permissions = phase
        .permissions.includes(:groups, :permissions_custom_fields)
        .order_by_action(phase)
        .map { |permission| McpServer::Serializers::Permission.serialize(permission) }

      ok(
        "Found #{permissions.size} permission(s) on phase #{phase.id}",
        structured: { phase_id: phase.id, permissions: permissions }
      )
    rescue ActiveRecord::RecordNotFound
      error("Phase not found: #{params[:phase_id]}")
    end
  end
end
