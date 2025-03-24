# frozen_string_literal: true

module Analysis
  class HeatmapGenerationJob < ApplicationJob
    self.priority = 45 # Slightly more important than emails (50)

    def run(analysis)

      inputs_count = analysis.inputs.count
      participants_service = ParticipantsService.new
      participants_count = participants_service.project_participants_count(analysis.project)

      if participants_count < 30
        return
      end

      analysis.heatmap_cells.destroy_all
      # generator = HeatmapGenerator.new(analysis)
      generator = AutoInsightsService.new(analysis)
      HeatmapCell::UNIT_TYPES.each do |unit|
        generator.generate(unit:)
      end

      # Put into table for later use
      # Rails.logger.info "Inputs count: #{inputs_count}" + timestamp of the newest input
      # Rails.logger.info "Participants count: #{participants_count}"

    end
  end
end
