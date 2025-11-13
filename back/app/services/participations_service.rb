class ParticipationsService
  include Singleton

  def phase_participation(phase)
    participations = phase_participations(phase)

    # For other requests, some kind of filtering might be applied here
    # eg for permissions:
    # participations = phase_participations(permission.phase)
    # participations = participations.filter_by_action(participations, permission.action))

    # phase_participation_data(phase, participations) # All participations, including phase-level && action-levels

    phase_level_participation_data(participations) # Phase-level participations
  end

  def phase_demographics(phase)
    participations = phase_participations(phase)

    phase_level_demographics(phase, participations)
  end

  private

  def initialize
    @phase_participations = {}
    @permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new

    @cache_timestamps = {}
    @cache_ttl = 1.minute # Adjust 'Time To Live' as needed
  end

  # Fetch and cache participations in singleton for a phase
  def phase_participations(phase)
    cache_key = phase.id

    # Expire old cache
    if @cache_timestamps[cache_key] && @cache_timestamps[cache_key] < @cache_ttl.ago
      @phase_participations.delete(cache_key)
    end

    @phase_participations[cache_key] ||= begin
      @cache_timestamps[cache_key] = Time.current
      phase.pmethod.participations
    end
  end

  # Just the phase-level participation data (not including action-level breakdowns, nor demographics)
  def phase_level_participation_data(participations)
    format_participation_data(participations.values.flatten)
  end

  def phase_level_demographics(phase, participations)
    phase_participations_permissions = phase.permissions.where.not(action: 'attending_event')
    participant_ids = participations.values.flatten.pluck(:user_id).uniq
    participant_custom_field_values = participants_custom_field_values(participations.values.flatten, participant_ids)
    demographics(phase_participations_permissions, participant_custom_field_values)
  end

  def phase_participation_data(participations)
    # phase_participations_permissions = phase.permissions.where.not(action: 'attending_event') # Needed for demographics

    phase_level = format_participation_data(participations.values.flatten, phase_participations_permissions)
    actions_level = participations.map do |action_type, records|
      {
        action_type: action_type.to_s,
        **format_participation_data(records, [phase_participations_permissions.find { |p| p.action == action_type.to_s }])
      }
    end

    { **phase_level, actions: actions_level }
  end

  # Participations at phase && action levels - Not used ATM
  def format_participation_data(participations)
    participant_ids = participations.pluck(:user_id).uniq
    total_participant_count = participant_ids.count
    # participant_custom_field_values = participants_custom_field_values(participations, participant_ids)

    participants_before_7_days_count = participations.select { |p| p[:acted_at] < 7.days.ago }.pluck(:user_id).uniq.count
    participants_change_last_7_days = total_participant_count - participants_before_7_days_count

    {
      metrics: {
        visitors: 'not implemented',
        participations: participations.count,
        participations_last_7_days: participations.count { |p| p[:acted_at] >= 7.days.ago },
        participants: total_participant_count,
        participants_last_7_days: participants_change_last_7_days
      }
    }
  end

  def participants_custom_field_values(participations, participant_ids)
    # Build lookup hash to avoid O(n × p) repeated searches. Reduces to O(n + p).
    participation_by_user = participations.group_by { |p| p[:user_id] }

    # Get first participation's custom field values for each unique user
    participant_ids.map do |user_id|
      participation_by_user[user_id].first[:user_custom_field_values]
    end
  end

  def demographics(permissions, participant_custom_field_values)
    # Get the set of unique permissions custom fields across all permissions
    # TODO: Make a standalone method in PermissionsCustomFieldsService, to make testing easier
    unique_fields = permissions.flat_map do |permission|
      @permissions_custom_fields_service.fields_for_permission(permission)
    end.uniq

    unique_fields.each_with_object({}) do |field, demographics_hash|
      custom_field = field.custom_field

      if custom_field.key == 'birthyear'
        age_stats = UserCustomFields::AgeStats.calculate(participant_custom_field_values)

        # TODO: Copied from StatsUsersController#users_by_age. Consider moving to a shared location (a service?).
        demographics_hash['users_by_age'] = {
          total_user_count: age_stats.user_count,
          unknown_age_count: age_stats.unknown_age_count,
          series: {
            user_counts: age_stats.binned_counts,
            reference_population: age_stats.population_counts,
            bins: age_stats.bins
          }
        }
      else
        counts = UserCustomFields::FieldValueCounter.counts_by_field_option(participant_custom_field_values, custom_field)

        # TODO: Copied from StatsUsersController#users_by_custom_field. Consider moving to a shared location (a service?).
        demographics_hash[custom_field.key] = {
          series: {
            users: counts,
            reference_population: calculate_reference_population(custom_field) || {}
          },
          title_multiloc: custom_field.title_multiloc
        }
      end

      if custom_field.options.present?
        demographics_hash[custom_field.key][:options] = custom_field.options.to_h do |o|
          [o.key, o.attributes.slice('title_multiloc', 'ordering')]
        end
      end
    end
  end

  # TODO: Copied from StatsUsersController. Consider moving to a shared location (a service?).
  def calculate_reference_population(custom_field)
    return if custom_field.key == 'birthyear'
    return if (ref_distribution = custom_field.current_ref_distribution).blank?

    ref_distribution.distribution_by_option_key
  end
end
