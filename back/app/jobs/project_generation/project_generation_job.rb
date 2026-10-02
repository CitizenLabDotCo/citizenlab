# frozen_string_literal: true

module ProjectGeneration
  # Generates a whole project draft with AI and writes it into the (already created)
  # project through the MCP tools. See ProjectGenerator for the orchestration.
  #
  # Always enqueue via +with_tracking+: the frontend polls the tracker, and a
  # generation that fails is reported as a completed tracker with an error.
  class ProjectGenerationJob < ApplicationJob
    include Jobs::TrackableJob

    self.priority = 45

    MAX_RETRY_COUNT = 2

    RETRYABLE_ERRORS = [
      RubyLLM::RateLimitError,
      RubyLLM::OverloadedError,
      RubyLLM::ServerError,
      RubyLLM::ServiceUnavailableError
    ].freeze

    def perform(project, user, prompt, files, locale, levers)
      result = ProjectGenerator.new(project, user, locale)
        .generate_and_persist(prompt: prompt, files: files, levers: levers)

      if result.failed?
        ErrorReporter.report_msg("Project generation could not save the project: #{result.errors.to_json}")
        fail_generation!
      else
        ErrorReporter.report_msg("Project generation finished with non-fatal errors: #{result.errors.to_json}") if result.errors.any?
        track_progress
        mark_as_complete!
      end
    rescue ProjectGenerator::InvalidOutputError => e
      ErrorReporter.report(e)
      fail_generation!
    end

    def handle_error(error)
      retryable = RETRYABLE_ERRORS.any? { |klass| error.is_a?(klass) }
      retryable && error_count <= MAX_RETRY_COUNT ? super : expire
    end

    private

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
