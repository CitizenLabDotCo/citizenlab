# frozen_string_literal: true

module ReportBuilder
  # One turn of the report chat, in the background: the model answers the admin and,
  # when they asked for a change, rewrites the report's layout.
  #
  # It runs as a job for the same reason generation does — a turn that adds a chart
  # is a minute of model calls and SQL — and the panel follows it by polling the
  # chat, which is pending for as long as the turn is running.
  class ReviseReportJob < ApplicationJob
    include Jobs::TrackableJob

    # A turn that fails on a malformed model reply fails the same way on every
    # attempt, and each attempt is a paid model call.
    MAX_RETRY_COUNT = 1

    # @param craftjs_json [Hash, nil] the layout as it stands in the admin's editor,
    #   which is what gets revised. It can be ahead of what is stored: they do not
    #   have to save before asking for a change. Falls back to the stored layout for
    #   a caller that has no editor open.
    def run(report, instruction:, locale:, craftjs_json: nil)
      # The turn was given up on while this job waited (see Report#recover_lost_runs!),
      # and the admin has been told it failed. Running it now would answer a question
      # they may have asked again since.
      return mark_as_complete! unless report.chat&.running?

      tracker.update!(progress: 0, error_count: 0)
      run_record = Run.create!(conversation: report.chat!(locale: locale), kind: 'revision')
      composer = Composition::ReportComposer.new(
        report.reported_project,
        locale: locale,
        phase: report.phase,
        author: tracker.owner,
        layout_record: report.layout,
        run_record: run_record
      )

      begin
        result = composer.revise(
          # ActiveJob symbolizes hash arguments on the way through the queue, and
          # every craftjs reader here works in string keys.
          current_layout: craftjs_json.presence&.deep_stringify_keys || report.layout.craftjs_json,
          instruction: instruction,
          # The whole conversation so far, tool calls included: the model remembers the
          # chart it wrote rather than re-reading it.
          history: Composition::Messages.history(
            Run.session_runs_for(report).flat_map { |run| run.messages.to_a }
          )
        )
      ensure
        record_outcome(run_record, composer)
      end

      save_layout!(report, result[:layout], run_record) if result[:layout].present?
      # Part of the run, so the panel can tell from the run whether this answer came
      # with a new layout to pull into the editor.
      run_record.append_message!(
        role: 'assistant', content: reply_for(result, composer.stopped_because), replayed: false
      )
      report.chat.update!(status: 'idle', last_error_code: nil)

      track_progress
      mark_as_complete!
    end

    def handle_error(error)
      error_count > MAX_RETRY_COUNT ? expire : super
    end

    private

    def save_layout!(report, craftjs_json, run_record)
      report.layout.craftjs_json = craftjs_json
      raise ActiveRecord::RecordInvalid, report unless ReportSaver.new(report, tracker.owner).save

      run_record.report_saved!
    end

    # The model's own closing sentence when it finished; a plain account of what
    # happened when it did not get to write one.
    def reply_for(result, stopped_because)
      return result[:reply] if result[:reply].present? && stopped_because == 'done'

      case stopped_because
      when 'cancelled' then 'Stopped. What I had changed so far is saved.'
      when 'timeout', 'round_cap' then 'I ran out of time before finishing. What I had changed so far is saved.'
      else result[:reply].presence || (result[:layout].present? ? 'Done.' : 'I did not change anything.')
      end
    end

    def record_outcome(run_record, composer)
      run_record.update!(
        model: composer.model_name,
        usage: composer.usage,
        stopped_because: composer.stopped_because
      )
    rescue StandardError => e
      ErrorReporter.report(e, extra: { run_id: run_record.id })
    end

    # Called on the final failure. Expire the Que job first (so the tracker exposes
    # the error), then answer in the chat: a turn with no answer leaves the panel
    # waiting forever.
    def expire
      super
      arguments.first.fail_chat_turn!('turn_failed')
      mark_as_complete!
    end

    def job_tracking_context
      report = arguments.first
      report.phase || report.project
    end

    def estimate_tracker_total(_report, **_kwargs)
      1
    end
  end
end
