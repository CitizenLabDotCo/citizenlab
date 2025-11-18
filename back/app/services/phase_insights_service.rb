class PhaseInsightsService
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

  # TODO: Implement caching? (may not be needed if performance good enough)
  # Removed funky caching used when originally used Singleton pattern.
  def cached_insights_data(phase)
    visits_data = VisitsService.new.phase_visits_data(phase)
    participations = phase.pmethod.participations
    flattened_participations = participations.values.flatten
    participant_ids = flattened_participations.pluck(:user_id).uniq

    metrics_data(phase, participations, participant_ids, visits_data).merge(
      demographics: { fields: demographics_data(phase, flattened_participations, participant_ids) }
    )
  end

  def metrics_data(phase, participations, participant_ids, visits_data)
    total_participant_count = participant_ids.count
    flattened_participations = participations.values.flatten
    participants_last_7_days_count = flattened_participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:user_id).uniq.count

    base_metrics = {
      visitors: visits_data[:total],
      visitors_last_7_days: visits_data[:last_7_days],
      participants: total_participant_count,
      participants_last_7_days: participants_last_7_days_count,
      engagement_rate: visits_data[:total] > 0 ? (total_participant_count.to_f / visits_data[:total]).round(3) : 0
    }

    participation_method_metrics = {
      phase.participation_method => participation_method_metrics(phase, participations)
    }

    { metrics: base_metrics.merge(participation_method_metrics) }
  end

  # TBD to cover the different needs for different participation methods
  def participation_method_metrics(phase, participations)
    case phase.participation_method
    when 'voting'
      voting_data(phase, participations)
    else
      {}
    end
  end

  def voting_data(phase, participations)
    voting_participations = participations[:voting]

    online_votes = voting_participations.sum { |p| p[:votes] }
    online_votes_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.sum { |p| p[:votes] }
    offline_votes = phase.manual_votes_count
    voters = voting_participations.pluck(:user_id).uniq.count
    voters_last_7_days = voting_participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:user_id).uniq.count

    {
      votes: online_votes + offline_votes,
      votes_last_7_days: online_votes_last_7_days,
      offline_votes: offline_votes,
      voters: voters,
      voters_last_7_days: voters_last_7_days,
      ideas: associated_ideas_count(phase),
      comments: phase_comments(participations)
    }
  end

  def associated_ideas_count(phase)
    phase.ideas.where(publication_status: 'published').count
  end

  # idea comments posted during the phase
  def phase_comments(participations)
    participations[:commenting_idea].count
  end

  # TODO: Add last_7_days variants
  # Needs rethinking. e.g. comments for voting phase should probably only count comments posted during that phase
  # rubocop:disable Layout/TrailingWhitespace
  # def ideas_data(phase)
  #   # Use raw SQL to avoid ActiveRecord's implicit ordering issues
  #   sql = <<~SQL.squish
  #     SELECT 
  #       COUNT(DISTINCT ideas.id) as ideas_count,
  #       COUNT(DISTINCT comments.id) as comments_count,
  #       COUNT(DISTINCT reactions.id) as reactions_count
  #     FROM ideas
  #     INNER JOIN ideas_phases ON ideas_phases.idea_id = ideas.id
  #     LEFT JOIN comments ON comments.idea_id = ideas.id
  #     LEFT JOIN reactions ON reactions.reactable_id = ideas.id AND reactions.reactable_type = 'Idea'
  #     WHERE ideas_phases.phase_id = $1 
  #       AND ideas.publication_status = 'published'
  #   SQL

  #   result = ActiveRecord::Base.connection.exec_query(sql, 'ideas_data', [phase.id]).first

  #   {
  #     inputs: result['ideas_count'],
  #     comments: result['comments_count'],
  #     reactions: result['reactions_count']
  #   }
  # end
  # rubocop:enable Layout/TrailingWhitespace

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
        r_score: nil, # May be set below (or null if no ref distribution).
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
