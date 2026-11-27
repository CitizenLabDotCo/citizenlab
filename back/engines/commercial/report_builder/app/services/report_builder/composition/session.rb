# frozen_string_literal: true

module ReportBuilder
  module Composition
    # Which of a report's runs the next chat turn continues from.
    #
    # Read back in order, those runs are the conversation the model continues, tool
    # calls included. That is what lets a turn remember the chart it wrote three turns
    # ago without re-reading it.
    module Session
      module_function

      # Past this, the oldest chat turns are left out of what the model is sent. The
      # first generation always stays: it is where the charts were written.
      #
      # Measured in characters rather than messages, because messages are not a size:
      # a turn that patches a layout or writes a chart is orders of magnitude bigger
      # than a one-word reply, so a message count puts no real ceiling on the prompt.
      # Four characters to a token is the usual rough proxy, which puts this around
      # 100k tokens and leaves the rest of the window for the system prompt, the docs
      # and the reply.
      MAX_HISTORY_CHARS = 400_000

      # The latest finished generation and the finished turns after it, oldest first.
      # Runs before that generation are about a report that no longer exists.
      #
      # The session opens at the latest generation that actually saved a report, not
      # merely the latest that stopped. A generation that saved nothing wrote no blocks
      # and deleted the ones it had started, so its messages refer to things that are
      # no longer there — and taken as the start it would also drop the generation that
      # did produce the report, along with every turn since. Failed runs are left out
      # for the same reason.
      #
      # @return [Array<AIAssistant::Run>]
      def runs_for(report)
        runs = report.runs.finished.not_failed.oldest_first.to_a
        start = runs.rindex { |run| run.kind == Report::GENERATION_KIND && run.applied? }
        return [] if start.nil?

        generation = runs[start]
        # Only the chat turns after it. Any later generation saved nothing — had it
        # saved, it would be the one this session opens at — so it describes work the
        # report does not hold.
        revisions = runs[(start + 1)..].reject { |run| run.kind == Report::GENERATION_KIND }
        kept = [generation]
        budget = MAX_HISTORY_CHARS - size_in_chars(generation)
        revisions.reverse_each do |run|
          size = size_in_chars(run)
          break if budget < size

          kept.insert(1, run)
          budget -= size
        end

        kept
      end

      # What a run adds to a prompt that replays it. Asked of the code that does the
      # replaying, so that what is budgeted for and what is sent cannot drift apart.
      def size_in_chars(run)
        Messages.replayed_size(run.messages)
      end
    end
  end
end
