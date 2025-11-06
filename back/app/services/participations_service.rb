class ParticipationsService
  include Singleton

  def phase_participation(phase)
    participations = phase_participations(phase)

    # For other requests, some kind of filtering might be applied here
    # eg for permissions:
    # participations = phase_participations(permission.phase)
    # participations = participations.filter_by_action(participations, permission.action))
    phase_participation_data(participations)
  end

  private

  def initialize
    @phase_participations = {}
  end

  # Fetch and cache participations in singleton for a phase
  def phase_participations(phase)
    @phase = phase
    @phase_participations[phase.id] ||= phase.pmethod.participations
  end

  def phase_participation_data(participations)
    phase_participations_permissions = @phase.permissions.where.not(action: 'attending_event') # Needed for demographics

    phase_level = format_participation_data(participations.values.flatten, phase_participations_permissions)
    actions_level = participations.map do |action_type, records|
      {
        action_type: action_type.to_s,
        **format_participation_data(records, [phase_participations_permissions.find { |p| p.action == action_type.to_s }])
      }
    end

    { **phase_level, actions: actions_level }
  end

  def format_participation_data(participations, permissions)
    participants = User.where(id: participations.pluck(:user_id).uniq) # We probably don't want to do this (we already have the user custom_field_values)

    total_participant_count = participations.pluck(:user_id).uniq.count
    participants_before_7_days_count = participations.select { |p| p[:acted_at] < 7.days.ago }.pluck(:user_id).uniq.count
    participants_change_last_7_days = total_participant_count - participants_before_7_days_count

    {
      participations: {
        count: participations.count,
        change_last_7_days: participations.count { |p| p[:acted_at] >= 7.days.ago }
      },
      participants: {
        count: total_participant_count,
        change_last_7_days: participants_change_last_7_days,
        demographics: demographics(permissions, participants)
      }
    }
  end

  # Just starting to play with this - by no means a final version!
  def demographics(permissions, participants)
    permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new

    # Need to get the set of unique permissions custom fields across all permissions
    unique_fields = permissions.flat_map do |permission|
      permissions_custom_fields_service.fields_for_permission(permission)
    end.uniq

    unique_fields.each_with_object({}) do |field, demographics_hash|
      custom_field = field.custom_field
      counts = UserCustomFields::FieldValueCounter.counts_by_field_option(participants, custom_field)
      reference_population = calculate_reference_population(custom_field) || {}

      demographics_hash[custom_field.key] = {
        counts: counts,
        reference_population: reference_population,
        title_multiloc: custom_field.title_multiloc
      }

      if custom_field.options.present?
        demographics_hash[custom_field.key][:options] = custom_field.options.to_h do |o|
          [o.key, o.attributes.slice('title_multiloc', 'ordering')]
        end
      end
    end
  end

  def calculate_reference_population(custom_field)
    return if custom_field.key == 'birthyear'
    return if (ref_distribution = custom_field.current_ref_distribution).blank?

    ref_distribution.distribution_by_option_key
  end
end
