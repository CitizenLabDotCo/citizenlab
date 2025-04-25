# frozen_string_literal: true

class CreateHeatmapGenerationJob < ApplicationJob
  queue_as :default

  def run(now)
    HeatmapGenerationService.new.create_heatmap_generation_job(now: now)
  end
end
