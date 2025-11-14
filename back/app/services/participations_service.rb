class ParticipationsService
  include Singleton

  def phase_insights(phase)
    participations = phase_participations(phase).values.flatten

    phase_insights_data(phase, participations)
  end

  private

  def initialize
    @phase_participations = {}
    @phase_visitors = {}
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

  def phase_visitors_data(phase)
    cache_key = "visitors_#{phase.id}"

    # Expire old cache
    if @cache_timestamps[cache_key] && @cache_timestamps[cache_key] < @cache_ttl.ago
      @phase_visitors.delete(cache_key)
    end

    @phase_visitors[cache_key] ||= begin
      @cache_timestamps[cache_key] = Time.current

      constraints = { project_id: phase.project.id }
      
      if phase.end_at.present?
        constraints[:created_at] = phase.start_at..phase.end_at
      else
        constraints[:created_at] = phase.start_at..
      end

      visitor_identifiers = ImpactTracking::Session
        .joins(:pageviews)
        .where(impact_tracking_pageviews: constraints)
        .distinct
        .pluck(
          Arel.sql("COALESCE(NULLIF(user_id::text, ''), monthly_user_hash)")
        )
        .compact
        .uniq

      visitor_identifiers.count
    end
  end

  def phase_insights_data(phase, participations)
    participant_ids = participations.pluck(:user_id).uniq

    phase_metrics_data(phase, participations, participant_ids).merge(
      demographics: { fields: phase_demographics_data(phase, participations, participant_ids) }
    )
  end

  def phase_metrics_data(phase, participations, participant_ids)
    visitors_count = phase_visitors_data(phase)
    total_participant_count = participant_ids.count
    participants_before_7_days_count = participations.select { |p| p[:acted_at] < 7.days.ago }.pluck(:user_id).uniq.count
    participants_change_last_7_days = total_participant_count - participants_before_7_days_count

    {
      metrics: {
        visitors: visitors_count,
        participants: total_participant_count,
        engagement_rate: total_participant_count > 0 ? (total_participant_count.to_f / visitors_count).round(3) : 0,
        participations: participations.count,
        visitors_last_7_days: 'not implemented',
        new_participants_last_7_days: participants_change_last_7_days,
        participations_last_7_days: participations.count { |p| p[:acted_at] >= 7.days.ago }
      }
    }
  end

  def phase_demographics_data(phase, participations, participant_ids)
    participant_custom_field_values = participants_custom_field_values(participations, participant_ids)

    custom_fields = phase.permissions.flat_map do |permission| # TODO: Maybe phase.permissions.where.not(action: 'attending_event')?
      @permissions_custom_fields_service.fields_for_permission(permission)
    end.map(&:custom_field).uniq

    custom_fields.map do |custom_field|
      reference_distribution = nil

      result = {
        id: custom_field.id,
        key: custom_field.key,
        code: custom_field.code,
        r_score: nil, # May be set below
        title_multiloc: custom_field.title_multiloc,
        series: nil # Will be set below
      }

      if custom_field.key == 'birthyear'
        age_stats = UserCustomFields::AgeStats.calculate(participant_custom_field_values)
        distribution_counts = age_stats.reference_distribution['distribution']['counts']

        formatted_data = age_stats.format_in_ranges
        reference_distribution = formatted_data[:ranged_reference_distribution]

        result[:r_score] = calculate_r_score(age_stats.binned_counts, distribution_counts)
        result[:series] = formatted_data[:ranged_series]
      else
        counts = UserCustomFields::FieldValueCounter.counts_by_field_option(participant_custom_field_values, custom_field)
        reference_distribution = calculate_reference_distribution(custom_field) || {}

        result[:r_score] = calculate_r_score(counts, reference_distribution)
        result[:series] = counts

        if custom_field.options.present?
          result[:options] = custom_field.options.to_h do |o|
            [o.key, o.attributes.slice('title_multiloc', 'ordering')]
          end
        end
      end

      result[:population_distribution] = reference_distribution

      result
    end
  end

  def participants_custom_field_values(participations, participant_ids)
    # Build lookup hash to avoid O(n × p) repeated searches. Reduces to O(n + p).
    participation_by_user = participations.group_by { |p| p[:user_id] }

    # Get first participation's custom field values for each unique user
    participant_ids.map do |user_id|
      participation_by_user[user_id].first[:user_custom_field_values]
    end
  end

  # TODO: Copied from StatsUsersController. Consider moving to a shared location (a service?).
  def calculate_reference_distribution(custom_field)
    return if custom_field.key == 'birthyear'
    return if (ref_distribution = custom_field.current_ref_distribution).blank?

    ref_distribution.distribution_by_option_key
  end

  def calculate_r_score(counts, reference_distribution)
    return nil if reference_distribution.blank?

    UserCustomFields::Representativeness::RScore.compute_scores(counts, reference_distribution)[:min_max_p_ratio]
  end
end
