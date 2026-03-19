# frozen_string_literal: true

module PublicApi
  class V2::Insights::VisitsController < PublicApiController
    VALID_RESOLUTIONS = %w[all year month day hour].freeze

    def index
      resolution = params[:resolution] || 'month'

      unless VALID_RESOLUTIONS.include?(resolution)
        raise InvalidEnumParameterValueError.new('resolution', resolution, VALID_RESOLUTIONS)
      end

      project_id = params[:project_id]
      start_at = params[:start_at] || default_start_at(resolution)
      end_at = params[:end_at]

      service = ::Insights::VisitsService.new(project_id, start_at:, end_at:)

      visits = if resolution == 'all'
        [service.total_visits]
      else
        format_visits(service.visits_by_date(resolution), resolution)
      end

      render json: { visits: visits }
    end

    private

    def format_visits(visits, resolution)
      visits.map do |visit|
        {
          visits: visit[:visits],
          visitors: visit[:visitors],
          date_group: resolution == 'hour' ? visit[:date_group].strftime('%Y-%m-%d %H:%M') : visit[:date_group]
        }
      end
    end

    def default_start_at(resolution)
      case resolution
      when 'day' then 1.year.ago.to_date.to_s
      when 'hour' then 1.week.ago.to_date.to_s
      end
    end
  end
end
