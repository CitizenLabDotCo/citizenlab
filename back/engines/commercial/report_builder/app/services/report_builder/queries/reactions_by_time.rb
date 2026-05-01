# frozen_string_literal: true

module ReportBuilder
  class Queries::ReactionsByTime < ReportBuilder::Queries::Base
    RESOLUTION_TO_INTERVAL = {
      'month' => 'month',
      'week' => 'week',
      'day' => 'day'
    }.freeze

    def run_query(start_at: nil, end_at: nil, project_id: nil, resolution: nil, **_other_props)
      interval = RESOLUTION_TO_INTERVAL.fetch(resolution || 'month')

      scope = idea_reactions_scope(start_at, end_at, project_id)

      time_series = time_series_query(scope, interval)
      total = total_query(scope)

      [time_series, total]
    end

    private

    def idea_reactions_scope(start_at, end_at, project_id)
      scope = Reaction.where(reactable_type: 'Idea')
        .joins('INNER JOIN ideas ON ideas.id = reactions.reactable_id')
      scope = scope.where('reactions.created_at::date >= ?', start_at.to_date) if start_at.present?
      scope = scope.where('reactions.created_at::date <= ?', end_at.to_date) if end_at.present?
      scope = scope.where(ideas: { project_id: project_id }) if project_id.present?
      scope
    end

    def time_series_query(scope, interval)
      format = case interval
               when 'month' then 'YYYY-MM'
               when 'week' then 'IYYY-IW'
               when 'day' then 'YYYY-MM-DD'
               end

      group_expr = "to_char(date_trunc('#{interval}', reactions.created_at), '#{format}')"

      scope
        .group(Arel.sql(group_expr))
        .order(Arel.sql('MIN(reactions.created_at)'))
        .pluck(Arel.sql(<<~SQL.squish))
          SUM(CASE WHEN reactions.mode = 'down' THEN 1 ELSE 0 END),
          SUM(CASE WHEN reactions.mode = 'up' THEN 1 ELSE 0 END),
          #{group_expr},
          MIN(reactions.created_at)::date
        SQL
        .map do |dislikes, likes, group_key, first_date|
          {
            'sum_dislikes_count' => dislikes,
            'sum_likes_count' => likes,
            "dimension_date_created.#{interval}" => group_key,
            'first_dimension_date_created_date' => first_date
          }
        end
    end

    def total_query(scope)
      total = scope.count
      [{ 'sum_reactions_count' => total }]
    end
  end
end
