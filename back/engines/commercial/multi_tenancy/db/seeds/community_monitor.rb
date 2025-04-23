# frozen_string_literal: true

require_relative 'base'

module MultiTenancy
  module Seeds
    class CommunityMonitor < Base
      def initialize(runner:, num_quarters: 2, ai_responses: false, locale: nil)
        @num_quarters = num_quarters
        @ai_responses = ai_responses # NOTE: Never set this to true for any tests or environment resets
        @locale = locale || Locale.default.to_s
        super(runner: runner)
      end

      def run
        service = CommunityMonitorService.new
        @project = service.project || service.create_and_set_project
        @phase = @project.phases.first
        @fields = @phase.custom_form.custom_fields.reject(&:page?)
        @num_quarters.times do |num_quarters_ago| # NOTE: 0 = current quarter
          runner.num_ideas.times do |index|
            create_survey_response((3 * num_quarters_ago).months.ago, index)
          end
        end
      end

      private

      def create_survey_response(created_at, index)
        question_keys = @fields.pluck(:key)
        answers = question_keys.index_with { |_k| rand(1..5) }
        follow_ups = question_keys.each_with_object({}) { |key, accu| accu["#{key}_follow_up"] = random_follow_up(key, index) }

        Idea.create!({
          project: @project,
          phases: [@phase],
          creation_phase: @phase,
          publication_status: 'published',
          created_at: created_at,
          custom_field_values: answers.merge(follow_ups)
        })
      end

      def random_follow_up(question_key, index)
        return Faker::Movie.quote unless @ai_responses

        random_ai_responses(question_key)[index] || Faker::Movie.quote
      end

      def random_ai_responses(question_key)
        @random_ai_responses ||= {}
        @random_ai_responses[question_key] ||= begin
          question = @fields.find { _1.key == question_key }.title_multiloc[@locale.to_s]
          language = Locale.new(@locale).language_copy
          llm = Analysis::LLM::GPT4oMini.new
          prompt = Analysis::LLM::Prompt.new.fetch(
            'sentiment_random_responses',
            question: question,
            language: language,
            num_responses: runner.num_ideas
          )
          response = llm.chat(prompt).strip
          raw_statements = response.match(/\[.+\]/m)&.try(:[], 0)
          raw_statements ? JSON.parse(raw_statements) : []
        end
      end
    end
  end
end
