# frozen_string_literal: true

module ReportBuilder
  # One turn of the report chat, in the background: the model answers the admin and,
  # when they asked for a change, rewrites the report's layout.
  #
  # It runs as a job for the same reason generation does — a turn that adds a chart
  # is a minute of model calls and SQL — and the panel follows it by polling the
  # chat, which is pending for as long as the last turn is the admin's.
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
      tracker.update!(progress: 0, error_count: 0)
      chat = report.chat || report.create_chat!

      result = Composition::ReportComposer
        .new(report.reported_project, locale: locale, phase: report.phase, author: tracker.owner)
        .revise(
          # ActiveJob symbolizes hash arguments on the way through the queue, and
          # every craftjs reader here works in string keys.
          current_layout: craftjs_json.presence&.deep_stringify_keys || report.layout.craftjs_json,
          instruction: instruction,
          history: chat.messages_for_model
        )

      changed = result[:layout].present?
      save_layout!(report, result[:layout]) if changed
      answer(chat, result[:reply].presence || default_reply(result[:layout]), changed_layout: changed)

      track_progress
      mark_as_complete!
    end

    def handle_error(error)
      error_count > MAX_RETRY_COUNT ? expire : super
    end

    private

    def save_layout!(report, craftjs_json)
      report.layout.craftjs_json = craftjs_json
      raise ActiveRecord::RecordInvalid, report unless ReportSaver.new(report, tracker.owner).save
    end

    # Reload before appending: the controller wrote the admin's turn after this job
    # was enqueued, and it must not be lost.
    # changed_layout tells the panel whether to pull the new layout into the editor.
    # On a turn that changed nothing it must not, or it would overwrite edits the
    # admin has made and not saved.
    def answer(chat, text, changed_layout: false)
      chat.reload
      chat.update!(transcript: chat.transcript + [{
        'role' => 'assistant',
        'text' => text,
        'at' => Time.current.iso8601,
        'changed_layout' => changed_layout
      }])
    end

    def default_reply(layout)
      layout.present? ? 'Done.' : 'I did not change anything.'
    end

    # Called on the final failure. Expire the Que job first (so the tracker exposes
    # the error), then answer in the chat: a turn with no answer leaves the panel
    # waiting forever.
    def expire
      super
      answer(arguments.first.chat, 'Something went wrong on my side. Please try again.')
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
