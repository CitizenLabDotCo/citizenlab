# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CommunityMonitor < Base
      def run
        @project = CommunityMonitorService.new.create_and_set_project
        @phase = @project.phases.first
        @question_keys = @phase.custom_form.custom_fields.reject(&:page?).pluck(:key)

        # Responses for this quarter
        runner.num_ideas.times { create_survey_response(Time.zone.now) }

        # Responses for previous quarter
        runner.num_ideas.times { create_survey_response(3.months.ago) }
      end

      private

      def create_survey_response(created_at)
        response = @question_keys.index_with { |_k| rand(1..5) }
        Idea.create!({
          # idea_status: runner.rand_instance(IdeaStatus.for_public_posts),
          project: @project,
          phases: [@phase],
          creation_phase: @phase,
          publication_status: 'published',
          created_at: created_at,
          custom_field_values: response
        })
      end
    end
  end
end
