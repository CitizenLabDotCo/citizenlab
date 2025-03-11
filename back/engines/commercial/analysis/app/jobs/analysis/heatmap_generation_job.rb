# frozen_string_literal: true

module Analysis
  class HeatmapGenerationJob < ApplicationJob
    self.priority = 45 # Slighltly more important than emails (50)

    def run(analysis)
      analysis.heatmap_cells.destroy_all

      # generator = HeatmapGenerator.new(analysis)
      generator = AutoInsightsService.new(analysis)
      HeatmapCell::UNIT_TYPES.each do |unit|
        generator.generate(unit:)
      end
    end
  end
end
