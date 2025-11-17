class PhaseInsightsService
  include Singleton

  def insights_data(phase)
    cached_insights_data(phase)
  end

  private

  def initialize
    @insights_data = {}
    @permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new

    @cache_timestamps = {}
    @cache_ttl = 1.minute
  end

  def cached_insights_data(phase)
    cache_key = "phase_insights_#{phase.id}"

    # Expire old cache
    if @cache_timestamps[cache_key] && @cache_timestamps[cache_key] < @cache_ttl.ago
      @insights_data.delete(cache_key)
    end

    @insights_data[cache_key] ||= begin
      @cache_timestamps[cache_key] = Time.current

      visits_data = VisitsService.new.phase_visits_data(phase)
      participations = phase.pmethod.participations.values.flatten
      participant_ids = participations.pluck(:user_id).uniq

      metrics_data(phase, participations, participant_ids, visits_data).merge(
        demographics: { fields: demographics_data(phase, participations, participant_ids) }
      )
    end
  end

  def metrics_data(phase, participations, participant_ids, visits_data)
    total_participant_count = participant_ids.count
    participants_last_7_days_count = participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:user_id).uniq.count

    base_metrics = {
      visitors: visits_data[:total],
      participants: total_participant_count,
      engagement_rate: visits_data[:total] > 0 ? (total_participant_count.to_f / visits_data[:total]).round(3) : 0,
      participations: participations.count,
      visitors_last_7_days: visits_data[:last_7_days],
      participants_last_7_days: participants_last_7_days_count,
      participations_last_7_days: participations.count { |p| p[:acted_at] >= 7.days.ago }
    }

    pmethod_specific_metrics = pmethod_specific_metrics(phase, participations)

    # Build explicitly in desired order
    all_metrics = base_metrics.dup
    pmethod_specific_metrics.each { |k, v| all_metrics[k] = v }

    { metrics: all_metrics }
  end

  def pmethod_specific_metrics(phase, _participations)
    case phase.participation_method
    when 'voting'
      ideas_data(phase)
    else
      {}
    end
  end

  def ideas_data(phase)
    # Use raw SQL to avoid ActiveRecord's implicit ordering issues
    sql = <<~SQL
      SELECT 
        COUNT(DISTINCT ideas.id) as ideas_count,
        COUNT(DISTINCT comments.id) as comments_count,
        COUNT(DISTINCT reactions.id) as reactions_count
      FROM ideas
      INNER JOIN ideas_phases ON ideas_phases.idea_id = ideas.id
      LEFT JOIN comments ON comments.idea_id = ideas.id
      LEFT JOIN reactions ON reactions.reactable_id = ideas.id AND reactions.reactable_type = 'Idea'
      WHERE ideas_phases.phase_id = $1 
        AND ideas.publication_status = 'published'
    SQL

    result = ActiveRecord::Base.connection.exec_query(sql, 'ideas_data', [phase.id]).first

    {
      inputs: result['ideas_count'],
      comments: result['comments_count'],
      reactions: result['reactions_count']
    }
  end

  def demographics_data(phase, participations, participant_ids)
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

      result[:reference_distribution] = reference_distribution

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
