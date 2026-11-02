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
          Tool.new(McpServer::Tools::GetFormFields, pinned: container),
          # The form version at the start of the turn: approving fails if the form changed since.
          Tool.new(
            McpServer::Tools::ReplaceFormFields,
            pinned: container.merge(fields_last_updated_at: subject.custom_form&.fields_last_updated_at&.iso8601)
          )
        ]
      end

      # A form created after the proposal has no pinned version, so the tool's own stale check misses it.
      def changed_since_proposal?(tool_call)
        tool_call.pinned_arguments['fields_last_updated_at'].nil? && CustomForm.exists?(participation_context: subject)
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
          writable: writable?,
          platform_locales: AppConfiguration.instance.settings('core', 'locales')
        )
      end

      # Mirrors the rules of the MCP tools: no changes to a survey with responses, or to a project that isn't a draft.
      def writable?
        return false if subject.ideas_count.to_i.positive?

        subject.project.admin_publication.draft? ||
          McpServer::BaseTool::Runner::PUBLISHED_WRITABLE_LIFECYCLES.include?(AppConfiguration.instance.lifecycle_stage)
      end
    end
  end
end
