# frozen_string_literal: true

module AIAssistant
  module Surfaces
    # The form builder of a native survey phase.
    class SurveyBuilder < Surface
      def self.key
        'survey_builder'
      end

      def self.subject_class
        Phase
      end

      def available?
        subject.participation_method == 'native_survey'
      end

      def tools
        @tools ||= [
          Tool.new(McpServer::Tools::GetFormFields, pinned: container)
        ]
      end

      private

      def container
        { container_type: 'phase', container_id: subject.id }
      end

      def surface_prompt(locale:)
        multiloc_service = MultilocService.new
        ::Analysis::LLM::Prompt.new.fetch(
          'ai_assistant_survey_builder',
          locale:,
          phase_title: multiloc_service.t(subject.title_multiloc, locale),
          project_title: multiloc_service.t(subject.project.title_multiloc, locale),
          responses_count: subject.ideas_count.to_i,
          platform_locales: AppConfiguration.instance.settings('core', 'locales')
        )
      end
    end
  end
end
