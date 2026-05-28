# frozen_string_literal: true

class McpServer::Tools::ListPhasePermissions < McpServer::BaseTool
  description <<~DESC.squish
    Lists the permissions of a phase (one per applicable action, e.g. posting_idea, voting).
    Permissions are auto-created with the phase — there is no create tool.
    Call before update_phase_permission to see which actions exist.
  DESC

  input_schema(
    properties: {
      phase_id: { type: 'string' }
    },
    required: %w[phase_id]
  )

  def self.call(phase_id:, server_context:)
    phase = Phase.find(phase_id)

    permissions = phase
      .permissions.includes(:groups, :permissions_custom_fields)
      .order_by_action(phase)
      .map { |permission| serialize(permission) }

    structured_content = { phase_id: phase.id, permissions: permissions }
    summary = "Found #{permissions.size} permission(s) on phase #{phase.id}"

    # MCP spec recommends duplicating structured_content into a text block for
    # clients that don't surface structuredContent to the LLM (e.g. Claude Desktop).
    text = "#{summary}\n\n#{structured_content.to_json}"

    MCP::Tool::Response.new(
      [{ type: 'text', text: }],
      structured_content:
    )
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Phase not found: #{phase_id}" }],
      error: true
    )
  end

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
end
