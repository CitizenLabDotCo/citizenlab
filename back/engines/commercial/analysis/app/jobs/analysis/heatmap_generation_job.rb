# frozen_string_literal: true

module Analysis
  class HeatmapGenerationJob < ApplicationJob
    self.priority = 45 # Slighltly more important than emails (50)

    def run(analysis)
      analysis.heatmap_cells.destroy_all

      generator = HeatmapGenerator.new(analysis)
      CustomField.registration.filter(&:support_options?).each do |cf|
        generator.generate(analysis.tags, cf.options)
      end
    end
  end
end
