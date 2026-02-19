module Insights
  class BasePhaseInsightsService
    attr_reader :phase

    def initialize(phase)
      @phase = phase
    end

    # --- TEMPLATE METHOD (Instance Method) ---
    # This method defines the immutable workflow for all child services.
    def call
      participations = cached_phase_participations
      cached_insights_data(participations)
    end

    # TODO: Implement caching, as intention is to resue cached participations in various places
    def cached_phase_participations
      # Imagine some caching stuff is here ;-)
      phase_participations
    end

    private

    # TODO: Implement caching? (may not be needed if performance good enough)
    def cached_insights_data(participations)
      visits = VisitsService.new.phase_visits(@phase)
      flattened_participations = participations.values.flatten
      participant_ids = flattened_participations.pluck(:participant_id).uniq
      participation_method_metrics = phase_participation_method_metrics(participations)
      metrics = metrics_data(participations, participant_ids, visits, participation_method_metrics)
      demographics = demographics_data(flattened_participations, participant_ids)
      participants_and_visitors_chart_data = participants_and_visitors_chart_data(flattened_participations, visits)

      metrics.merge(demographics: { fields: demographics }, participants_and_visitors_chart_data: participants_and_visitors_chart_data)
    end

    def metrics_data(participations, participant_ids, visits, participation_method_metrics)
      base_metrics = base_metrics(participations, participant_ids, visits)

      phase_participation_method_metrics = {
        @phase.participation_method => participation_method_metrics
      }

      { metrics: base_metrics.merge(phase_participation_method_metrics) }
    end

    def base_metrics(participations, participant_ids, visits)
      visitors_count = visits.pluck(:visitor_id).uniq.count
      participants_count = participant_ids.count
      base_7_day_changes = base_7_day_changes(participations, visits)

      {
        visitors: visitors_count,
        visitors_7_day_percent_change: base_7_day_changes[:visitors_7_day_percent_change],
        participants: participants_count,
        participants_7_day_percent_change: base_7_day_changes[:participants_7_day_percent_change],
        participation_rate_as_percent: visitors_count > 0 ? ((participants_count.to_f / visitors_count) * 100).round(1) : 'participant_count_compared_with_zero_visitors',
        participation_rate_7_day_percent_change: base_7_day_changes[:participation_rate_7_day_percent_change]
      }
    end

    def base_7_day_changes(participations, visits)
      flattened_participations = participations.values.flatten

      participants_last_7_days_count = flattened_participations.select do |p|
        p[:acted_at] >= 7.days.ago
      end.pluck(:participant_id).uniq.count

      participants_previous_7_days_count = flattened_participations.select do |p|
        p[:acted_at] < 7.days.ago && p[:acted_at] >= 14.days.ago
      end.pluck(:participant_id).uniq.count

      visitors_last_7_days_count = visits.select do |v|
        v[:acted_at] >= 7.days.ago
      end.pluck(:visitor_id).uniq.count

      visitors_previous_7_days_count = visits.select do |v|
        v[:acted_at] < 7.days.ago && v[:acted_at] >= 14.days.ago
      end.pluck(:visitor_id).uniq.count

      participation_rate_7_day_percent_change = if visitors_last_7_days_count > 0 && visitors_previous_7_days_count > 0
        participation_rate_last_7_days = participants_last_7_days_count.to_f / visitors_last_7_days_count
        participation_rate_previous_7_days = participants_previous_7_days_count.to_f / visitors_previous_7_days_count
        percentage_change(participation_rate_previous_7_days, participation_rate_last_7_days)
      else
        'no_visitors_in_one_or_both_periods'
      end

      {
        visitors_7_day_percent_change: percentage_change(visitors_previous_7_days_count, visitors_last_7_days_count),
        participants_7_day_percent_change: percentage_change(participants_previous_7_days_count, participants_last_7_days_count),
        participation_rate_7_day_percent_change: participation_rate_7_day_percent_change
      }
    end

    def phase_has_run_more_than_14_days?
      time_now = Time.current.to_date
      phase_end_date = @phase.end_at || time_now

      # Check if the phase duration (start to end or current date) is less than 14 days
      # Add 1 to include both start and end dates (inclusive counting)
      phase_duration_days = (phase_end_date - @phase.start_at).to_i + 1

      return false if phase_duration_days < 14

      # Check if the elapsed time from phase start to now is more than 14 days
      elapsed_days = (time_now - @phase.start_at).to_i

      elapsed_days >= 14
    end

    def percentage_change(old_value, new_value)
      return nil unless phase_has_run_more_than_14_days?
      return 0.0 if old_value == new_value # Includes case where both are zero
      return 'last_7_days_compared_with_zero' if old_value.zero? # Infinite percentage change (avoid division by zero)

      # Round to one decimal place
      (((new_value - old_value).to_f / old_value) * 100.0).round(1)
    end

    def participations_7_day_change(participations)
      return nil unless phase_has_run_more_than_14_days?
      return 0.0 if participations.empty?

      participations_last_7_days = participations.select { |p| p[:acted_at] >= 7.days.ago }
      participations_previous_7_days = participations.select do |p|
        p[:acted_at] < 7.days.ago && p[:acted_at] >= 14.days.ago
      end

      percentage_change(
        participations_previous_7_days.count,
        participations_last_7_days.count
      )
    end

    def participant_id(item_id, user_id, user_hash = nil)
      user_id.presence || user_hash.presence || item_id
    end

    def associated_published_ideas_count
      @phase.ideas.where(publication_status: 'published').count
    end

    # Parses user custom_field_values from both the item (if values)
    # and/or the participant (user) referenced in each participation.
    # Item values take precedence over participant values in case of key collisions,
    # to prefer demographics at the time of participation.
    def parse_user_custom_field_values(item, participant)
      user_cfvs = participant&.custom_field_values || {}

      return user_cfvs if !item.respond_to?(:custom_field_values) || item.custom_field_values.blank?

      prefix = @user_fields_prefix ||= UserFieldsInFormService.prefix

      item_cfvs = item.custom_field_values
        .select { |key, _| key.to_s.start_with?(prefix) }
        .transform_keys { |key| key.to_s.delete_prefix(prefix) }

      user_cfvs.merge(item_cfvs)
    end

    def demographics_data(participations, participant_ids)
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
          title_multiloc: custom_field.title_multiloc,
          series: nil # Will be set below
        }

        if custom_field.key == 'birthyear'
          birthyear_data = birthyear_demographics_data(participant_custom_field_values)
          result[:series] = birthyear_data[:series]
          reference_distribution = birthyear_data[:reference_distribution]
        elsif custom_field.supports_reference_distribution?
          select_or_checkbox_data = select_or_checkbox_field_demographics_data(participant_custom_field_values, custom_field)
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

      if age_stats.reference_distribution.present?
        distribution_data = age_stats.reference_distribution.distribution

        if distribution_data.is_a?(Hash)
          formatted_data = age_stats.format_in_ranges
          reference_distribution = formatted_data[:ranged_reference_distribution]
        end
      end

      formatted_data = age_stats.format_in_ranges

      {
        series: formatted_data[:ranged_series],
        reference_distribution: reference_distribution
      }
    end

    def select_or_checkbox_field_demographics_data(participant_custom_field_values, custom_field)
      counts = select_or_checkbox_counts_for_field(participant_custom_field_values, custom_field)
      reference_distribution = calculate_reference_distribution(custom_field)

      options = nil
      if custom_field.options.present?
        options = custom_field.options.to_h do |o|
          [o.key, o.attributes.slice('title_multiloc', 'ordering')]
        end
      end

      {
        series: counts,
        reference_distribution: reference_distribution,
        options: options
      }
    end

    def select_or_checkbox_counts_for_field(participant_custom_field_values, custom_field)
      counts = UserCustomFields::FieldValueCounter.counts_by_field_option(participant_custom_field_values, custom_field)

      # Ensure checkbox fields always include both true and false options in consistent order
      if custom_field.input_type == 'checkbox'
        counts = {
          true => counts[true] || 0,
          false => counts[false] || 0,
          '_blank' => counts['_blank']
        }.compact
      end

      counts
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

    def participants_and_visitors_chart_data(flattened_participations, visits)
      resolution = chart_resolution
      grouped_visits = visits.group_by { |v| date_truncate(v[:acted_at], resolution) }
      grouped_participations = flattened_participations.group_by { |p| date_truncate(p[:acted_at], resolution) }

      # Get all unique date groups from both participations and visits
      all_date_groups = (grouped_participations.keys + grouped_visits.keys).uniq.sort

      grouped_timeseries = all_date_groups.map do |date_group|
        participations_in_group = grouped_participations[date_group] || []
        visits_in_group = grouped_visits[date_group] || []

        {
          participants: participations_in_group.pluck(:participant_id).uniq.count,
          visitors: visits_in_group.pluck(:visitor_id).uniq.count,
          date_group: date_group
        }
      end

      {
        resolution: resolution,
        timeseries: grouped_timeseries.sort_by { |row| row[:date_group] }
      }
    end

    # Modelled on logic in getSensibleresolution.ts, with addition of 'year' resolution
    def chart_resolution
      end_at = @phase.end_at.present? ? @phase.end_at.to_time : Time.current
      duration_seconds = end_at - @phase.start_at.to_time
      duration_months = (duration_seconds / 1.month).round(1)
      duration_weeks = (duration_seconds / 1.week).round(1)

      if duration_months > 6
        'month'
      elsif duration_weeks > 4
        'week'
      else
        'day'
      end
    end

    # Week start is Monday, as in similar data produced by ReportBuilder Queries
    def date_truncate(datetime, resolution)
      date = datetime.to_date
      case resolution
      when 'day'
        date
      when 'week'
        date.beginning_of_week
      else # 'month'
        Date.new(date.year, date.month, 1)
      end
    end
  end
end
