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

      # The record exists before the first model call: the versions the run writes
      # point at it, and the cancel endpoint marks it while the run is going.
      run_record = GenerationTranscript.create!(report: report, kind: 'generation')
      composer = Composition::ReportComposer.new(
        report.reported_project,
        locale: locale,
        phase: report.phase,
        author: tracker.owner,
        layout_record: report.layout,
        run_record: run_record
      )

      begin
        craftjs_json = composer.compose
      ensure
        # Filled in whether the run produced a report or not: a failed run is the one
        # whose reasoning someone actually needs to read.
        record_transcript(run_record, composer)
      end

      report.layout.craftjs_json = craftjs_json
      raise ActiveRecord::RecordInvalid, report unless ReportSaver.new(report, tracker.owner).save

      SideFxReportService.new.after_generate(report, tracker.owner)
      track_progress
      mark_as_complete!
    end

    def handle_error(error)
      error_count > MAX_RETRY_COUNT ? expire : super
    end

    private

    def record_transcript(run_record, composer)
      run_record.update!(
        model: composer.model_name,
        messages: composer.transcript,
        usage: composer.usage,
        stopped_because: composer.stopped_because
      )
    rescue StandardError => e
      # Never let bookkeeping take down a run that otherwise worked.
      ErrorReporter.report(e, extra: { report_id: run_record.report_id })
    end

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
