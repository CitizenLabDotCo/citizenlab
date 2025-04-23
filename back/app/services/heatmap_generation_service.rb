# frozen_string_literal: true

class HeatmapGenerationService
  def create_heatmap_generation_job(now: Time.current, since: 1.hour)
    now = AppConfiguration.timezone.at(now)

    create_generate_heatmap now
  end

  private

  def create_generate_heatmap(now)
    start_hour_utc = ENV.fetch('HEATMAP_CALCULATION_START_HOUR_UTC').to_i
    current_hour = now.utc.hour

    analyses = Analysis::Analysis.all.order(created_at: :asc)
    Array.new(10) { [] }

    analyses.each_with_index do |analysis, index|
      offset_hour = (start_hour_utc + index) % 24

      if current_hour == offset_hour
        Analysis::HeatmapGenerationJob.perform_later(analysis)
      end
    end
  end
end
