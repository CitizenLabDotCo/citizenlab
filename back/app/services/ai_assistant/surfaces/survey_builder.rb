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

      # A form created after the call has no pinned version, so the tool's own stale check misses it.
      def stale?(tool_call)
        tool_call.pinned_arguments['fields_last_updated_at'].nil? && CustomForm.exists?(participation_context: subject)
      end

      # A change must build on the current form, so the model reads it again once it changed.
      def write_call_error(tool, conversation)
        return unless tool.name == 'replace_form_fields'

        last_read_at = conversation.tool_calls.auto_executed.where(name: 'get_form_fields').maximum(:created_at)
        return 'Call get_form_fields first: a change must build on the current form.' unless last_read_at

        form_version = CustomForm.where(participation_context: subject).pick(:fields_last_updated_at)
        if form_version && form_version > last_read_at
          'The form changed since you last read it: call get_form_fields again, then propose the change again.'
        end
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
