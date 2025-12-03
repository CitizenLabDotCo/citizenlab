module Insights
  class BasePhaseInsightsService
    attr_reader :phase

    def initialize(phase)
      @phase = phase
    end

    # --- TEMPLATE METHOD (Instance Method) ---
    # This method defines the immutable workflow for all child services.
    def call
      cached_insights_data
    end

    private

    # TODO: Implement caching? (may not be needed if performance good enough)
    def cached_insights_data
      visits = VisitsService.new.phase_visits(@phase)
      participations = phase_participations # cache separately? (so can be reused in not yet implemented phase specific filtering/slicing methods?)
      flattened_participations = participations.values.flatten
      participant_ids = flattened_participations.pluck(:participant_id).uniq
      participation_method_metrics = phase_participation_method_metrics(participations)
      metrics = metrics_data(participations, participant_ids, visits, participation_method_metrics)
      demographics = demographics_data(flattened_participations, participant_ids)

      metrics.merge(demographics: { fields: demographics })
    end

    def metrics_data(participations, participant_ids, visits, participation_method_metrics)
      base_metrics = base_metrics(participations, participant_ids, visits)

      phase_participation_method_metrics = {
        @phase.participation_method => participation_method_metrics
      }

      { metrics: base_metrics.merge(phase_participation_method_metrics) }
    end

    def base_metrics(participations, participant_ids, visits)
      total_participant_count = participant_ids.count
      flattened_participations = participations.values.flatten

      participants_rolling_7_day_change = if phase_has_run_more_than_14_days?
        participants_last_7_days_count = flattened_participations.select { |p| p[:acted_at] >= 7.days.ago }.pluck(:participant_id).uniq.count
        participants_last_14_to_8_days_count = flattened_participations.select { |p| p[:acted_at] < 7.days.ago && p[:acted_at] >= 14.days.ago }.pluck(:participant_id).uniq.count
        percentage_change(participants_last_14_to_8_days_count, participants_last_7_days_count)
      end

      unique_visitors = visits.pluck(:visitor_id).compact.uniq.count
      unique_visitors_last_7_days = visits.select { |v| v[:acted_at] >= 7.days.ago }.pluck(:visitor_id).compact.uniq.count

      {
        visitors: unique_visitors,
        visitors_last_7_days: unique_visitors_last_7_days,
        participants: total_participant_count,
        participants_rolling_7_day_change: participants_rolling_7_day_change,
        engagement_rate: unique_visitors > 0 ? (total_participant_count.to_f / unique_visitors).round(3) : 0
      }
    end

    def phase_has_run_more_than_14_days?
      phase_start_at = @phase.start_at.to_time
      phase_end_at = (@phase.end_at || Time.current).to_time

      phase_duration_seconds = phase_end_at - phase_start_at
      phase_duration_days = (phase_duration_seconds / 86_400).to_i

      phase_duration_days >= 14
    end

    def participant_id(item_id, user_id, user_hash = nil)
      user_id.presence || user_hash.presence || item_id
    end

    def associated_published_ideas_count
      @phase.ideas.where(publication_status: 'published').count
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

    def demographics_data(participations, participant_ids)
      return [] if participant_ids.empty?

      participant_custom_field_values = participants_custom_field_values(participations, participant_ids)
      permissions_custom_fields_service = Permissions::PermissionsCustomFieldsService.new

      custom_fields = phase_permissions.flat_map do |permission|
        permissions_custom_fields_service.fields_for_permission(permission)
      end.map(&:custom_field).uniq

      # Eager load options to avoid N+1 queries
      custom_fields = CustomField.where(id: custom_fields.map(&:id)).includes(:options).to_a

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
        elsif custom_field.support_reference_distribution?
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

    def phase_permissions
      @phase.permissions
        .where.not(action: 'attending_event')
        .includes(:permissions_custom_fields, :groups)
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
        participation_by_user[participant_id]
          .find { |p| p[:user_custom_field_values].present? }
          &.dig(:user_custom_field_values) || {}
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

    def percentage_change(old_value, new_value)
      return nil if old_value.zero?

      # Round to one decimal place
      (((new_value - old_value).to_f / old_value) * 100).round(1)
    end
  end
end
