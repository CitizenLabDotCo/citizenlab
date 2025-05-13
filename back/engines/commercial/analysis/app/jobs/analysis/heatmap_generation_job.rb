# frozen_string_literal: true

module Analysis
  class HeatmapGenerationJob < ApplicationJob
    self.priority = 45 # Slightly more important than emails (50)

    def run(analysis)
      return unless AppConfiguration.instance.feature_activated?('auto_insights')

      inputs_count = analysis.inputs.count
      tags_count = analysis.tags.count
      participants_service = ParticipantsService.new
      participants_count = participants_service.project_participants_count(analysis.source_project)
      newest_activity = Activity.where(item: analysis, action: 'heatmap_generated')
        .order(created_at: :desc)
        .first
      newest_input_at = analysis.inputs.maximum(:created_at)
      additional_custom_field_ids = analysis.additional_custom_fields.pluck(:id)

      if participants_count >= 30 &&
         analysis.associated_custom_fields.size <= 50 && # Arbitrary limit to avoid the curse of dimensionality
         (newest_activity.nil? ||
          newest_activity.payload['participants_count'] != participants_count ||
          newest_activity.payload['inputs_count'] != inputs_count ||
          newest_activity.payload['newest_input_at'].to_i != newest_input_at.to_i ||
          newest_activity.payload['tags_count'] != tags_count ||
            newest_activity.payload['additional_custom_field_ids']&.sort != additional_custom_field_ids&.sort
         )

        analysis.heatmap_cells.destroy_all
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

        LogActivityJob.perform_later(
          analysis,
          'heatmap_generated',
          nil,
          Time.now.to_i,
          {
            payload: { inputs_count:,
                       participants_count:,
                       tags_count:,
                       newest_input_at: analysis.inputs.maximum(:created_at).to_i,
                       additional_custom_field_ids: additional_custom_field_ids },
            project_id: analysis.source_project.id
          }
        )
      end
    end
  end
end
