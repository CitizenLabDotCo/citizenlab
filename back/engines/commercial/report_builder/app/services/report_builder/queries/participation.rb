# frozen_string_literal: true

module ReportBuilder
  class Queries::Participation < ReportBuilder::Queries::Base
    RESOLUTION_TO_INTERVAL = {
      'month' => 'month',
      'week' => 'week',
      'day' => 'day'
    }.freeze

    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      interval = RESOLUTION_TO_INTERVAL.fetch(resolution || 'month')

      queries = [
        inputs_time_series(start_at, end_at, project_id, interval),
        comments_time_series(start_at, end_at, project_id, interval),
        baskets_time_series(start_at, end_at, project_id, interval)
      ]

      if compare_start_at.present? && compare_end_at.present?
        queries << inputs_count(compare_start_at, compare_end_at, project_id)
        queries << comments_count(compare_start_at, compare_end_at, project_id)
        queries << baskets_count(compare_start_at, compare_end_at, project_id)
      end

      queries
    end

    private

    def inputs_time_series(start_at, end_at, project_id, interval)
      scope = Idea.published
      scope = date_scope(scope, 'ideas.created_at', start_at, end_at)
      scope = scope.where(ideas: { project_id: project_id }) if project_id.present?
      scope = scope.left_joins(:creation_phase)
        .where('phases.id IS NULL OR phases.participation_method != ?', 'native_survey')

      time_series(scope, 'ideas.created_at', interval)
    end

    def comments_time_series(start_at, end_at, project_id, interval)
      scope = Comment.joins(:idea)
      scope = date_scope(scope, 'comments.created_at', start_at, end_at)
      scope = scope.where(ideas: { project_id: project_id }) if project_id.present?

      time_series(scope, 'comments.created_at', interval)
    end

    def baskets_time_series(start_at, end_at, project_id, interval)
      scope = Basket.submitted.joins(:phase)
      scope = date_scope(scope, 'baskets.created_at', start_at, end_at)
      scope = scope.where(phases: { project_id: project_id }) if project_id.present?

      time_series(scope, 'baskets.created_at', interval)
    end

    def inputs_count(start_at, end_at, project_id)
      scope = Idea.published
      scope = date_scope(scope, 'ideas.created_at', start_at, end_at)
      scope = scope.where(ideas: { project_id: project_id }) if project_id.present?
      scope = scope.left_joins(:creation_phase)
        .where('phases.id IS NULL OR phases.participation_method != ?', 'native_survey')

      [{ 'count' => scope.count }]
    end

    def comments_count(start_at, end_at, project_id)
      scope = Comment.joins(:idea)
      scope = date_scope(scope, 'comments.created_at', start_at, end_at)
      scope = scope.where(ideas: { project_id: project_id }) if project_id.present?

      [{ 'count' => scope.count }]
    end

    def baskets_count(start_at, end_at, project_id)
      scope = Basket.submitted.joins(:phase)
      scope = date_scope(scope, 'baskets.created_at', start_at, end_at)
      scope = scope.where(phases: { project_id: project_id }) if project_id.present?

      [{ 'count' => scope.count }]
    end

    def date_scope(scope, column, start_at, end_at)
      scope = scope.where("#{column}::date >= ?", start_at.to_date) if start_at.present?
      scope = scope.where("#{column}::date <= ?", end_at.to_date) if end_at.present?
      scope
    end

    def time_series(scope, date_column, interval)
      format = case interval
      when 'month' then 'YYYY-MM'
      when 'week' then 'IYYY-IW'
      when 'day' then 'YYYY-MM-DD'
      end

      group_expr = "to_char(date_trunc('#{interval}', #{date_column}), '#{format}')"

      scope
        .group(Arel.sql(group_expr))
        .order(Arel.sql("MIN(#{date_column})"))
        .pluck(Arel.sql("COUNT(*), #{group_expr}, MIN(#{date_column})::date"))
        .map do |count, group_key, first_date|
          {
            'count' => count,
            "dimension_date_created.#{interval}" => group_key,
            'first_dimension_date_created_date' => first_date
          }
        end
    end
  end
end
