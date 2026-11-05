# frozen_string_literal: true

class McpServer::Tools::UpdatePhasePermission < McpServer::BaseTool
  def name = 'update_phase_permission'
  def title = 'Update phase permission'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: true,
      idempotent_hint: true,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Updates a phase permission. Sets who can perform an action, with optional group
      restrictions, demographic-question requirements, verification recency, and a custom
      rejection message. An action the phase has not customised yet follows the platform-wide
      sign-in settings (inherited: true in list_phase_permissions); updating it gives the phase
      settings of its own, starting from the ones it was inheriting.
    DESC
  end

  def input_schema
    {
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
            - users: must have an account (default). Combine with require_name, require_password,
              require_confirmed_email, require_verification and require_confirmed_phone_number to
              fine-tune what an account needs.
            - admins_moderators: project admins/moderators only. When set, group_ids,
              demographic_questions, and the require_* flags have no effect.
          DESC
        },
        require_name: {
          type: 'boolean',
          description: 'Whether the participant must provide a first and last name. Only applies when permitted_by is "users". Defaults to true.'
        },
        require_password: {
          type: 'boolean',
          description: 'Whether the participant must set a password. Only applies when permitted_by is "users". Defaults to true.'
        },
        require_confirmed_email: {
          type: 'boolean',
          description: 'Whether the participant must confirm their email address. Only applies when permitted_by is "users". Requires the password_login feature (with signup) to be enabled. Defaults to true.'
        },
        confirmed_email_expiry: {
          type: %w[integer null],
          description: 'Number of days before email reconfirmation is required; null means never reconfirm.'
        },
        require_verification: {
          type: 'boolean',
          description: 'Whether the participant must complete identity verification. Only applies when permitted_by is "users". Requires a verification method to be configured. Defaults to false.'
        },
        group_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Restricts to members of these groups (narrows further). Call list_groups to find group IDs. Ignored when permitted_by is "everyone" or "admins_moderators". Pass [] to clear.'
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
            Only used when require_verification is true. How recent verification must be:
            - null: verify once, never expires
            - 0: re-verify if older than 30 minutes
            - 7: within last 7 days
            - 30: within last 30 days
          DESC
        },
        require_confirmed_phone_number: {
          type: 'boolean',
          description: 'Whether the participant must confirm a phone number by SMS. Only applies when permitted_by is "users". Requires the sms feature to be enabled. Defaults to false.'
        },
        confirmed_phone_number_expiry: {
          type: %w[integer null],
          description: 'Number of days before phone-number reconfirmation is required; null means never reconfirm. Only used when require_confirmed_phone_number is true.'
        },
        access_denied_explanation_multiloc: {
          **multiloc_schema,
          type: %w[object null],
          description: <<~DESC.squish
            Custom message shown to denied users (e.g. "You must be 18 or older to vote").
            Merged per locale: locales in the payload are overwritten, absent locales
            keep their current value. Pass null to remove the custom message
            (participants then see the default explanation).
          DESC
        }
      },
      required: %w[phase_id action permitted_by]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.find_by(id: params[:phase_id])
      return not_found_error('Phase', params[:phase_id]) unless phase

      authorize_project!(phase.project)

      # Resolves to the row the phase owns or, for an action it has not
      # customised, to the copy of the global 'visiting' permission it follows.
      # See Permissions::PermissionInheritanceService.
      permission = inheritance_service.find(phase, params[:action])
      return invalid_action_response(phase, params[:action]) unless permission

      authorize(permission, :update?)

      # slice keeps explicit nulls
      # (an absent key leaves the field unchanged)
      attributes = params.slice(
        :permitted_by,
        :group_ids,
        :require_name,
        :require_password,
        :require_confirmed_email,
        :confirmed_email_expiry,
        :require_verification,
        :verification_expiry,
        :require_confirmed_phone_number,
        :confirmed_phone_number_expiry,
        :access_denied_explanation_multiloc
      )

      ActiveRecord::Base.transaction do
        # Customising an action means detaching it from the global 'visiting'
        # permission first: a no-op once the phase owns the action. Inside the
        # transaction so that a rejected update leaves no override behind.
        permission = inheritance_service.override!(phase, params[:action])
        permission.update!(merge_multilocs(permission, attributes))
        replace_demographic_questions(permission, params[:demographic_questions]) if params.key?(:demographic_questions)
      end

      response(
        "Updated #{params[:action]} permission on phase #{phase.id}",
        structured: McpServer::Serializers::Permission.serialize(permission.reload)
      )
    rescue ActiveRecord::RecordInvalid => e
      invalid_record_error(e.record)
    end

    private

    def inheritance_service
      @inheritance_service ||= Permissions::PermissionInheritanceService.new
    end

    def invalid_action_response(phase, action)
      valid_actions = Permission.available_actions(phase) || []
      error(
        "Action '#{action}' does not apply to this phase (participation_method: '#{phase.participation_method}'). " \
        "Valid actions: #{valid_actions.join(', ')}."
      )
    end

    # Sets custom_fields_behavior and the permissions_custom_fields rows on the permission.
    # Three cases:
    #
    # - nil: reset to tenant defaults (all enabled user fields)
    # - []: no user fields at all
    # - [...]: use the specified list of fields
    #
    # Row replacement destroys all records and recreates them. Not the most efficient
    # approach, but much simpler, and recreating gives us correct ordering for free
    # (acts_as_list assigns position on insert).
    def replace_demographic_questions(permission, demographic_questions)
      permission.update!(custom_fields_behavior: behavior_for(demographic_questions))
      permission.permissions_custom_fields.destroy_all

      demographic_questions.to_a.each do |entry|
        permission.permissions_custom_fields.create!(
          custom_field_id: entry.fetch(:custom_field_id),
          required: entry.fetch(:required, true)
        )
      end
    end

    def behavior_for(demographic_questions)
      return 'global' if demographic_questions.nil?

      demographic_questions.empty? ? 'disabled' : 'custom'
    end
  end
end
