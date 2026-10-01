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

      def tool_specs
        @tool_specs ||= [
          ToolSpec.new(tool_class: McpServer::Tools::GetFormFields, bound: container),
          ToolSpec.new(
            tool_class: McpServer::Tools::ReplaceFormFields,
            bound: container,
            guards: { fields_last_updated_at: -> { record.custom_form&.fields_last_updated_at&.iso8601 } }
          )
        ]
      end

      private

      def container
        { container_type: 'phase', container_id: record.id }
      end

      def context_prompt(locale:)
        multiloc_service = MultilocService.new
        ::Analysis::LLM::Prompt.new.fetch(
          'ai_assistant_survey_builder',
          locale:,
          phase_title: multiloc_service.t(record.title_multiloc, locale),
          project_title: multiloc_service.t(record.project.title_multiloc, locale),
          responses_count: record.ideas_count.to_i,
          writable: writable?,
          platform_locales: AppConfiguration.instance.settings('core', 'locales')
        )
      end

      # Mirrors the draft-only rule of the MCP tools that change projects.
      def writable?
        record.project.admin_publication.draft? ||
          McpServer::BaseTool::Runner::PUBLISHED_WRITABLE_LIFECYCLES.include?(AppConfiguration.instance.lifecycle_stage)
      end
    end
  end
end
