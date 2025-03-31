# frozen_string_literal: true

module Analysis
  class HeatmapGenerationJob < ApplicationJob
    self.priority = 45 # Slightly more important than emails (50)

    def run(analysis)
      return unless AppConfiguration.instance.feature_activated?('statistical_insights')

      inputs_count = analysis.inputs.count
      participants_service = ParticipantsService.new
      participants_count = participants_service.project_participants_count(analysis.project)
      newest_activity = Activity.where(item: analysis, action: 'heatmap_generated')
        .order(created_at: :desc)
        .first
      newest_input_at = analysis.inputs.maximum(:created_at)

      if participants_count >= 30 &&
         (newest_activity.nil? ||
          newest_activity.payload['participants_count'] != participants_count ||
          newest_activity.payload['inputs_count'] != inputs_count ||
          newest_activity.payload['newest_input_at'].to_i != newest_input_at.to_i)

        analysis.heatmap_cells.destroy_all
        # generator = HeatmapGenerator.new(analysis)
        generator = AutoInsightsService.new(analysis)
        HeatmapCell::UNIT_TYPES.each do |unit|
          generator.generate(unit:)
        end

        LogActivityJob.perform_later(
          analysis,
          'heatmap_generated',
          nil,
          Time.now.to_i,
          {
            payload: { inputs_count:,
                       participants_count:,
                       newest_input_at: analysis.inputs.maximum(:created_at).to_i },
            project_id: analysis.source_project.id
          }
        )
      end
    end
  end
end
