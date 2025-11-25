class PhaseInsightsService
  SUPPORTED_CATEGORICAL_FIELD_TYPES = %w[select checkbox multiselect].freeze

  def insights_data(phase)
    cached_insights_data(phase)
  end

  private

  def initialize
    @permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new
  end

  # TODO: Implement caching? (may not be needed if performance good enough)
  # Removed funky caching used when originally used Singleton pattern.
  def cached_insights_data(phase)
    visitors_data = VisitsService.new.phase_visitors_data(phase)
    participations = phase.pmethod.participations
    flattened_participations = participations.values.flatten
    participant_ids = flattened_participations.pluck(:participant_id).uniq

    metrics_data(phase, participations, participant_ids, visitors_data).merge(
      demographics: { fields: demographics_data(phase, flattened_participations, participant_ids) }
    )
  end

  def metrics_data(phase, participations, participant_ids, visitors_data)
    base_metrics = base_metrics(participations, participant_ids, visitors_data)

    participation_method_metrics = {
      phase.participation_method => participation_method_metrics(phase, participations)
    }

    { metrics: base_metrics.merge(participation_method_metrics) }
  end

  # TODO: Add user_hash to all participations where available (e.g. ideas, comments),
  # and use in the various calculations of unique users,
  # whenever user_id is nil (for non-logged in users, participating anonymously), etc.
  def base_metrics(participations, participant_ids, visitors_data)
    total_participant_count = participant_ids.count
    flattened_participations = participations.values.flatten
    participants_last_7_days_count = flattened_participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:participant_id).uniq.count

    {
      visitors: visitors_data[:total],
      visitors_last_7_days: visitors_data[:last_7_days],
      participants: total_participant_count,
      participants_last_7_days: participants_last_7_days_count,
      engagement_rate: visitors_data[:total] > 0 ? (total_participant_count.to_f / visitors_data[:total]).round(3) : 0
    }
  end

  # TBD to cover the different needs for different participation methods
  def participation_method_metrics(phase, participations)
    case phase.participation_method
    when 'voting'
      voting_data(phase, participations)
    when 'ideation', 'proposals'
      ideation_data(participations)
    when 'common_ground'
      common_ground_data(phase, participations)
    when 'native_survey'
      native_survey_data(participations)
    else
      {}
    end
  end

  def voting_data(phase, participations)
    voting_participations = participations[:voting] || []
    online_votes = voting_participations.sum { |p| p[:votes] }
    online_votes_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.sum { |p| p[:votes] }
    offline_votes = phase.manual_votes_count
    voters = voting_participations.pluck(:participant_id).uniq.count
    voters_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:participant_id).uniq.count
    comments_counts = phase_comments_counts(participations)

    {
      online_votes: online_votes,
      online_votes_last_7_days: online_votes_last_7_days,
      offline_votes: offline_votes,
      voters: voters,
      voters_last_7_days: voters_last_7_days,
      associated_ideas: associated_published_ideas_count(phase),
      comments_posted: comments_counts[:total],
      comments_posted_last_7_days: comments_counts[:last_7_days]
    }
  end

  def ideation_data(participations)
    ideas_counts = phase_ideas_counts(participations[:posting_idea] || [])
    comments_counts = phase_comments_counts(participations)
    reactions_counts = phase_reactions_counts(participations)

    {
      ideas_posted: ideas_counts[:total],
      ideas_posted_last_7_days: ideas_counts[:last_7_days],
      comments_posted: comments_counts[:total],
      comments_posted_last_7_days: comments_counts[:last_7_days],
      reactions: reactions_counts[:total],
      reactions_last_7_days: reactions_counts[:last_7_days]
    }
  end

  def common_ground_data(phase, participations)
    ideas_counts = phase_ideas_counts(participations[:posting_idea] || [])
    reactions_counts = phase_reactions_counts(participations)

    {
      associated_ideas: associated_published_ideas_count(phase),
      ideas_posted: ideas_counts[:total],
      ideas_posted_last_7_days: ideas_counts[:last_7_days],
      reactions: reactions_counts[:total],
      reactions_last_7_days: reactions_counts[:last_7_days]
    }
  end

  def native_survey_data(participations)
    ideas_counts = phase_ideas_counts(participations[:posting_idea] || [])
    submitted_survey_participations = participations[:posting_idea]&.select { |p| p[:survey_submitted] } || []
    total_submitted_surveys = submitted_survey_participations.count
    submitted_surveys_last_7_days = submitted_survey_participations.count { |p| p[:acted_at] >= 7.days.ago }

    completion_rate = ideas_counts[:total] > 0 ? (total_submitted_surveys.to_f / ideas_counts[:total]).round(3) : 0

    {
      submitted_surveys: total_submitted_surveys,
      submitted_surveys_last_7_days: submitted_surveys_last_7_days,
      completion_rate: completion_rate
    }
  end

  def associated_published_ideas_count(phase)
    phase.ideas.where(publication_status: 'published').count
  end

  def phase_ideas_counts(participations)
    total_ideas = participations.count
    ideas_last_7_days = participations.count { |p| p[:acted_at] >= 7.days.ago }

    {
      total: total_ideas,
      last_7_days: ideas_last_7_days
    }
  end

  # idea comments posted during the phase
  def phase_comments_counts(participations)
    commenting_participations = participations[:commenting_idea] || []
    total_comments = commenting_participations.count
    comments_last_7_days = commenting_participations.count { |p| p[:acted_at] >= 7.days.ago }

    {
      total: total_comments,
      last_7_days: comments_last_7_days
    }
  end

  def phase_reactions_counts(participations)
    reacting_participations = participations[:reacting_idea] || []
    total_reactions = reacting_participations.count
    reactions_last_7_days = reacting_participations.count { |p| p[:acted_at] >= 7.days.ago }

    {
      total: total_reactions,
      last_7_days: reactions_last_7_days
    }
  end

  def demographics_data(phase, participations, participant_ids)
    return [] if participant_ids.empty?

    participant_custom_field_values = participants_custom_field_values(participations, participant_ids)

    custom_fields = phase_permissions(phase).flat_map do |permission|
      @permissions_custom_fields_service.fields_for_permission(permission)
    end.map(&:custom_field).uniq

    custom_fields.filter_map do |custom_field|
      reference_distribution = nil

      result = {
        id: custom_field.id,
        key: custom_field.key,
        code: custom_field.code,
        input_type: custom_field.input_type,
        r_score: nil, # May be set below (or null if no ref distribution).
        title_multiloc: custom_field.title_multiloc,
        series: nil # Will be set below
      }

      if custom_field.key == 'birthyear'
        birthyear_data = birthyear_demographics_data(participant_custom_field_values)
        result[:r_score] = birthyear_data[:r_score]
        result[:series] = birthyear_data[:series]
        reference_distribution = birthyear_data[:reference_distribution]
      elsif SUPPORTED_CATEGORICAL_FIELD_TYPES.include?(custom_field.input_type)
        select_or_checkbox_data = select_or_checkbox_field_demographics_data(participant_custom_field_values, custom_field)
        result[:r_score] = select_or_checkbox_data[:r_score]
        result[:series] = select_or_checkbox_data[:series]
        result[:options] = select_or_checkbox_data[:options] if select_or_checkbox_data[:options]
        reference_distribution = select_or_checkbox_data[:reference_distribution]
      else
        # Skip unsupported field types (other number fields, text fields, etc.)
        next
      end

      result[:reference_distribution] = reference_distribution

      result
    end
  end

  def phase_permissions(phase)
    phase.permissions.where.not(action: 'attending_event')
  end

  def birthyear_demographics_data(participant_custom_field_values)
    age_stats = UserCustomFields::AgeStats.calculate(participant_custom_field_values)
    reference_distribution = nil
    r_score = nil

    if age_stats.reference_distribution.present?
      distribution_data = age_stats.reference_distribution.distribution

      if distribution_data.is_a?(Hash) && distribution_data['counts']
        distribution_counts = distribution_data['counts']
        formatted_data = age_stats.format_in_ranges
        reference_distribution = formatted_data[:ranged_reference_distribution]
        r_score = calculate_r_score(age_stats.binned_counts, distribution_counts)
      end
    end

    formatted_data = age_stats.format_in_ranges

    {
      r_score: r_score,
      series: formatted_data[:ranged_series],
      reference_distribution: reference_distribution
    }
  end

  def select_or_checkbox_field_demographics_data(participant_custom_field_values, custom_field)
    counts = UserCustomFields::FieldValueCounter.counts_by_field_option(participant_custom_field_values, custom_field)

    # Ensure checkbox fields always include both true and false options in consistent order
    if custom_field.input_type == 'checkbox'
      counts = {
        true => counts[true] || 0,
        false => counts[false] || 0,
        '_blank' => counts['_blank']
      }.compact
    end

    reference_distribution = calculate_reference_distribution(custom_field)

    r_score = calculate_r_score(counts, reference_distribution)

    options = nil
    if custom_field.options.present?
      options = custom_field.options.to_h do |o|
        [o.key, o.attributes.slice('title_multiloc', 'ordering')]
      end
    end

    {
      r_score: r_score,
      series: counts,
      reference_distribution: reference_distribution,
      options: options
    }
  end

  def participants_custom_field_values(participations, participant_ids)
    # Build lookup hash to avoid O(n × p) repeated searches. Reduces to O(n + p).
    participation_by_user = participations.group_by { |p| p[:participant_id] }

    # Get first participation's custom field values for each unique user
    participant_ids.map do |participant_id|
      participation_by_user[participant_id].first[:user_custom_field_values]
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
