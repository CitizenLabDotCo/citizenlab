# frozen_string_literal: true

module BulkImportIdeas
  class SideFxBulkImportService
    def after_success(user, phase, model, format, items, users)
      options = { payload: { model: model, format: format, items_created: items.count, users_created: users.count } }

      project_analyses = Analysis::Analysis.where(project: phase.project)
      phase_analyses = Analysis::Analysis.where(phase: phase)
      analyses = (project_analyses + phase_analyses).uniq

      if items.count == 0
        LogActivityJob.perform_later phase, 'bulk_import_started', user, Time.now.to_i, options
      else
        LogActivityJob.perform_later phase, 'bulk_import_succeeded', user, items.last&.created_at, options
        analyses.each do |analysis|
          Analysis::HeatmapGenerationJob.perform_later(analysis)
        end
      end
    end

    def after_failure(user, phase, model, format, error)
      options = { payload: { model: model, format: format, error: error } }
      activity_object = phase
      LogActivityJob.perform_later activity_object, 'bulk_import_failed', user, Time.now.to_i, options
    end
  end
end
