# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CommunityMonitor < Base
      def initialize(runner:, num_quarters: 2)
        @num_quarters = num_quarters
        super(runner: runner)
      end

      def run
        service = CommunityMonitorService.new
        @project = service.project || service.create_and_set_project
        @phase = @project.phases.first
        @question_keys = @phase.custom_form.custom_fields.reject(&:page?).pluck(:key)

        @num_quarters.times.with_index do |num_quarters_ago| # NOTE: 0 = current quarter
          runner.num_ideas.times { create_survey_response((3 * num_quarters_ago).months.ago) }
        end
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
