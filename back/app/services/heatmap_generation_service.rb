# frozen_string_literal: true

class HeatmapGenerationService
  def create_heatmap_generation_job(now: Time.current, since: 1.hour)
  now = AppConfiguration.timezone.at(now)
  last_time = now - since

  create_generate_heatmap now
  end

  private
  def create_generate_heatmap(now)
    start_hour_utc = ENV.fetch('HEATMAP_CALCULATION_START_HOUR_UTC').to_i
    current_hour = now.utc.hour

    analyses = Analysis::Analysis.all.order(created_at: :asc)
    groups = Array.new(10) { [] }
    
    # Distribute analyses across groups
    analyses.each_with_index do |analysis, index|
      groups[index % 10] << analysis
    end

    # Process the appropriate group based on the current hour
    groups.each_with_index do |group, index|
      offset_hour = (start_hour_utc + index) % 24
      
      if current_hour == offset_hour
        group.each do |analysis|
            Analysis::HeatmapGenerationJob.perform_later(analysis)
        end
        break # Only one group should be processed per hour
      end
    end
  end
end