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
        answers = @question_keys.index_with { |_k| rand(1..5) }
        follow_ups = @question_keys.each_with_object({}) { |k, accu| accu["#{k}_follow_up"] = Faker::Movie.quote }

        Idea.create!({
          project: @project,
          phases: [@phase],
          creation_phase: @phase,
          publication_status: 'published',
          created_at: created_at,
          custom_field_values: answers.merge(follow_ups)
        })
      end
    end
  end
end
