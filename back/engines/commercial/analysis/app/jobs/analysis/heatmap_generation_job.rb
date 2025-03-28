# frozen_string_literal: true

module Analysis
  class HeatmapGenerationJob < ApplicationJob
    self.priority = 45 # Slightly more important than emails (50)

    def run(analysis)
      analysis.heatmap_cells.destroy_all

      # generator = HeatmapGenerator.new(analysis)
      generator = AutoInsightsService.new(analysis)
      pmethod = analysis.participation_context.pmethod

      generator.generate(unit: 'inputs')
      if pmethod.supports_reacting?
        generator.generate(unit: 'likes')
        generator.generate(unit: 'dislikes')
      end
      if pmethod.supports_public_visibility?
        generator.generate(unit: 'participants')
      end
    end
  end
end
