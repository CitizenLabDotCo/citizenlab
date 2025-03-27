# frozen_string_literal: true

module BulkImportIdeas
  class SideFxBulkImportService
    def after_success(user, phase, model, format, items, users)
      super
      # Get the project related to the phase
      project = phase.project

      # Get all analyses related to the project
      analyses = Analysis::Analysis.where(project: project)

      if items.count.positive?
        analyses.each do |analysis|
          HeatmapGenerationJob.perform_later(analysis)
        end
      end
    end
  end
end
