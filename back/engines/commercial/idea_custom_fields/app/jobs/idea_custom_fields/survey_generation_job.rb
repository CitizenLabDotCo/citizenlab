# frozen_string_literal: true

module IdeaCustomFields
  # Generates a native survey with AI and saves it on the phase through the
  # `replace_form_fields` MCP tool, which replaces all the existing fields.
  #
  # Always enqueue via +with_tracking+: the frontend polls the tracker, and a
  # generation that fails is reported as a completed tracker with an error.
  class SurveyGenerationJob < ApplicationJob
    include Jobs::TrackableJob

    self.priority = 45

    MAX_RETRY_COUNT = 2

    RETRYABLE_ERRORS = [
      RubyLLM::RateLimitError,
      RubyLLM::OverloadedError,
      RubyLLM::ServerError,
      RubyLLM::ServiceUnavailableError
    ].freeze

    def perform(phase, user, prompt, files, locale)
      fields = SurveyGenerator.new(phase, locale).generate(prompt: prompt, files: files)
      response = replace_form_fields(phase, user, fields)

      if response.error?
        ErrorReporter.report_msg("Survey generation could not save the survey: #{response.content.to_json}")
        fail_generation!
      else
        track_progress
        mark_as_complete!
      end
    rescue SurveyGenerator::InvalidOutputError => e
      ErrorReporter.report(e)
      fail_generation!
    end

    def handle_error(error)
      retryable = RETRYABLE_ERRORS.any? { |klass| error.is_a?(klass) }
      retryable && error_count <= MAX_RETRY_COUNT ? super : expire
    end

    private

    def replace_form_fields(phase, user, fields)
      tool = McpServer::Tools::ReplaceFormFields.for(current_user: user, token_scopes: [])
      arguments = { container_type: 'phase', container_id: phase.id, fields: fields }

      # Direct calls skip the argument validation that the MCP server does.
      tool.input_schema.validate_arguments(arguments)
      tool.call(server_context: {}, **arguments)
    end

    def expire
      fail_generation!
      super
    end

    def fail_generation!
      track_progress(1, 1)
      mark_as_complete!
    end

    def estimate_tracker_total(...)
      1
    end

    def job_tracking_context
      arguments.first
    end
  end
end
