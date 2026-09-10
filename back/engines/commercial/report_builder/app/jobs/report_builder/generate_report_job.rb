# frozen_string_literal: true

module ReportBuilder
  # Composes a report's layout with an LLM in the background, because a full
  # composition takes minutes, and writes the result to the report's layout.
  #
  # Always enqueue via +with_tracking+: the admin who started the run follows it
  # through the +Jobs::Tracker+, and the tracker's owner is who the layout is
  # saved as.
  #
  # Progress is one unit for the composition itself. It gains a unit per section
  # once sections are composed separately.
  class GenerateReportJob < ApplicationJob
    include Jobs::TrackableJob

    # A composition that fails on a malformed model reply fails the same way on
    # every attempt, and each attempt is a paid model call — so allow a single
    # retry for transient Bedrock errors instead of Que's default 15.
    MAX_RETRY_COUNT = 1

    # Que only calls a job's own +handle_error+ when the job defines +run+; a job
    # that defines +perform+ instead is error-handled by the ActiveJob wrapper,
    # which retries 15 times. MAX_RETRY_COUNT only bites from +run+.
    #
    # @param report [ReportBuilder::Report] must have a project to report on, either
    #   its own or the one behind its phase.
    def run(report, locale:)
      # A retry starts over; don't stack progress on the first attempt's.
      tracker.update!(progress: 0, error_count: 0)

      craftjs_json = Composition::ReportComposer
        .new(report.reported_project, locale: locale, phase: report.phase, author: tracker.owner)
        .compose

      report.layout.craftjs_json = craftjs_json
      raise ActiveRecord::RecordInvalid, report unless ReportSaver.new(report, tracker.owner).save

      track_progress
      mark_as_complete!
    end

    def handle_error(error)
      error_count > MAX_RETRY_COUNT ? expire : super
    end

    private

    # Called on the final failure. Expire the Que job first (so the tracker
    # exposes the error via +job_errors+), then complete the tracker so the
    # frontend stops polling and a new run can be started.
    def expire
      super
      mark_as_complete!
    end

    # The phase or the project, not the report: the tracker's project (which its
    # policy authorizes against) is derived from the context, and the frontend polls
    # by the context it has at hand.
    def job_tracking_context
      report = arguments.first
      report.phase || report.project
    end

    # Same signature as +run+.
    def estimate_tracker_total(_report, **_kwargs)
      1
    end
  end
end
