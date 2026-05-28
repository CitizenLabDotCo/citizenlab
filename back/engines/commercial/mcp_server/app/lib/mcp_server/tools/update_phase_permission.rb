# frozen_string_literal: true

class McpServer::Tools::UpdatePhasePermission < McpServer::BaseTool
  # Sentinel used to distinguish from explicit-nil in kwargs.
  OMITTED = Object.new.freeze
  private_constant :OMITTED

  description <<~DESC.squish
    Updates a phase permission (auto-created with the phase). Sets who can perform an action,
    with optional group restrictions, demographic-question requirements, verification recency,
    and a custom rejection message.
  DESC

  input_schema(
    properties: {
      phase_id: { type: 'string' },
      action: {
        type: 'string',
        enum: Permission::ACTIONS.except(nil).values.flatten.uniq.sort,
        description: 'Not every action applies to every phase. Call list_phase_permissions(phase_id) to see valid actions.'
      },
      permitted_by: {
        type: 'string',
        enum: Permission::PERMITTED_BIES.sort,
        description: <<~DESC
          - everyone: anyone, no sign-in or email needed.
          - everyone_confirmed_email: must confirm an email address (no account required).
          - users: must have an account (default).
          - verified: must have completed identity verification. Requires a verification method to be configured.
          - admins_moderators: project admins/moderators only. When set, group_ids, demographic_questions, and verification_expiry have no effect.
        DESC
      },
      group_ids: {
        type: 'array',
        items: { type: 'string' },
        description: 'Restricts to members of these groups (narrows further). Ignored when permitted_by is "everyone" or "admins_moderators". Pass [] to clear.'
      },
      demographic_questions: {
        type: %w[array null],
        items: {
          type: 'object',
          properties: {
            custom_field_id: { type: 'string' },
            required: { type: 'boolean', default: true }
          },
          required: %w[custom_field_id]
        },
        description: <<~DESC
          Profile questions to ask the participant before they can perform the action.
          Each entry's `required` flag determines whether the question blocks the action (true) or is skippable (false).
          Order in the array determines display order to the participant.

          Pass [] to ask no questions. Pass null to ask the platform-wide default questions
          (the user fields enabled in the platform's user profile settings — see list_user_custom_fields).
          Omit the field entirely to leave the existing configuration unchanged.

          Ignored when permitted_by is "everyone".
        DESC
      },
      verification_expiry: {
        type: %w[integer null],
        enum: [nil, 0, 7, 30],
        description: <<~DESC
          Only used when permitted_by is "verified". How recent verification must be:
          - null: verify once, never expires
          - 0: re-verify if older than 30 minutes
          - 7: within last 7 days
          - 30: within last 30 days
        DESC
      },
      access_denied_explanation_multiloc: {
        type: 'object',
        description: 'Custom message shown to denied users (e.g. "You must be 18 or older to vote"). Multiloc: { "en": "...", "fr-FR": "..." }.'
      }
    },
    required: %w[phase_id action permitted_by]
  )

  def self.call(
    phase_id:, action:, permitted_by:,
    group_ids: nil, demographic_questions: OMITTED,
    verification_expiry: nil, access_denied_explanation_multiloc: nil,
    server_context:
  )
    phase = Phase.find(phase_id)
    permission = phase.permissions.find_by(action: action)

    return invalid_action_response(phase, action) if permission.nil?

    attributes = {
      permitted_by: permitted_by,
      group_ids: group_ids,
      verification_expiry: verification_expiry,
      access_denied_explanation_multiloc: access_denied_explanation_multiloc
    }.compact

    ActiveRecord::Base.transaction do
      return validation_error_response(permission) unless permission.update(attributes)

      replace_demographic_questions(permission, demographic_questions) unless demographic_questions.equal?(OMITTED)
    end

    MCP::Tool::Response.new(
      [{ type: 'text', text: "Updated #{action} permission on phase #{phase.id}" }],
      structured_content: McpServer::Tools::ListPhasePermissions.serialize(permission.reload)
    )
  rescue ActiveRecord::RecordNotFound
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Phase not found: #{phase_id}" }],
      error: true
    )
  end

  def self.invalid_action_response(phase, action)
    valid_actions = Permission.available_actions(phase) || []
    MCP::Tool::Response.new(
      [{
         type: 'text',
         text: "Action '#{action}' does not apply to this phase (participation_method: '#{phase.participation_method}'). Valid actions: #{valid_actions.join(', ')}."
       }],
      error: true
    )
  end

  def self.validation_error_response(permission)
    MCP::Tool::Response.new(
      [{ type: 'text', text: "Validation failed: #{permission.errors.full_messages.join(', ')}" }],
      error: true
    )
  end

  # Sets global_custom_fields and the permissions_custom_fields rows on the permission.
  # Three cases:
  #
  # - nil: reset to tenant defaults (all enabled user fields)
  # - []: no user fields at all
  # - [...]: use the specified list of fields
  #
  # Row replacement destroys all records and recreates them. Not the most efficient
  # approach, but much simpler, and recreating gives us correct ordering for free
  # (acts_as_list assigns position on insert).
  #
  # @param permission [Permission]
  # @param demographic_questions [Array<Hash>, nil] each entry has keys:
  #   - `:custom_field_id` (String) — the user custom field id
  #   - `:required` (Boolean, default true) — whether the field is mandatory
  def self.replace_demographic_questions(permission, demographic_questions)
    permission.update!(global_custom_fields: demographic_questions.nil?)
    permission.permissions_custom_fields.destroy_all

    demographic_questions.to_a.each do |entry|
      permission.permissions_custom_fields.create!(
        custom_field_id: entry.fetch(:custom_field_id),
        required: entry.fetch(:required, true)
      )
    end
  end
end