# frozen_string_literal: true

class McpServer::Tools::ListPhasePermissions < McpServer::BaseTool
  def name = 'list_phase_permissions'

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

  # Kept as a class method — also called externally from UpdatePhasePermission.
  def self.serialize(permission)
    {
      action: permission.action,
      permitted_by: permission.permitted_by,
      group_ids: permission.groups.pluck(:id),
      demographic_questions: permission.permissions_custom_fields.map do |pcf|
        { custom_field_id: pcf.custom_field_id, required: pcf.required }
      end,
      verification_expiry: permission.verification_expiry,
      access_denied_explanation_multiloc: permission.access_denied_explanation_multiloc
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find(params[:phase_id])

      permissions = phase
        .permissions.includes(:groups, :permissions_custom_fields)
        .order_by_action(phase)
        .map { |permission| McpServer::Tools::ListPhasePermissions.serialize(permission) }

      ok(
        "Found #{permissions.size} permission(s) on phase #{phase.id}",
        structured: { phase_id: phase.id, permissions: permissions }
      )
    rescue ActiveRecord::RecordNotFound
      error("Phase not found: #{params[:phase_id]}")
    end
  end
end
