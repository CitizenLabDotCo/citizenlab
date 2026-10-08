# frozen_string_literal: true

module AIAssistant
  module Contexts
    # The form builder of a native survey phase.
    class SurveyBuilder < Context
      def self.key
        'survey_builder'
      end

      def self.record_class
        Phase
      end

      def available?
        record.participation_method == 'native_survey'
      end

      private

      def context_prompt(locale:)
        multiloc_service = MultilocService.new
        ::Analysis::LLM::Prompt.new.fetch(
          'ai_assistant_survey_builder',
          locale:,
          phase_title: multiloc_service.t(record.title_multiloc, locale),
          project_title: multiloc_service.t(record.project.title_multiloc, locale),
          responses_count: record.ideas_count.to_i,
          platform_locales: AppConfiguration.instance.settings('core', 'locales')
        )
      end
    end
  end
end
