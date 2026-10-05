# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_generation_transcripts
#
#  id                  :uuid             not null, primary key
#  report_id           :uuid             not null
#  model               :string           default(""), not null
#  kind                :string           default("generation"), not null
#  messages            :jsonb            not null
#  usage               :jsonb            not null
#  stopped_because     :string
#  cancel_requested_at :datetime
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_report_builder_generation_transcripts_on_report_id  (report_id)
#
# Foreign Keys
#
#  fk_rails_...  (report_id => report_builder_reports.id) ON DELETE => cascade
#
module ReportBuilder
  # What the model was told and what it did, for one run: the first generation, or
  # one turn of the chat.
  #
  # A run is minutes of paid work behind a background job with nobody watching. When
  # one produces a disappointing report, or none at all, this is the only way to tell
  # a bad prompt from a bad reply from a broken tool — everything else the run leaves
  # behind is the outcome, not the reasoning.
  #
  # The row is written when the run starts and filled in when it stops, so a run that
  # is still going has a record: the cancel endpoint marks it, and the versions a run
  # writes point back at it.
  #
  # Read back in order, the finished runs of a report are the conversation the model
  # continues on the next chat turn, tool calls included. That is what lets a turn
  # remember the chart it wrote three turns ago without re-reading it.
  class GenerationTranscript < ApplicationRecord
    KINDS = %w[generation revision].freeze
    STOP_REASONS = %w[done round_cap timeout cancelled failed].freeze
    STOPPED_EARLY = %w[round_cap timeout cancelled].freeze

    # Past this, the oldest chat turns are left out of what the model is sent. The
    # first generation always stays: it is where the charts were written.
    MAX_HISTORY_MESSAGES = 400

    belongs_to :report, class_name: 'ReportBuilder::Report', inverse_of: :generation_transcripts

    validates :kind, inclusion: { in: KINDS }
    validates :stopped_because, inclusion: { in: STOP_REASONS }, allow_nil: true

    scope :newest_first, -> { order(created_at: :desc) }
    scope :oldest_first, -> { order(created_at: :asc) }
    scope :generations, -> { where(kind: 'generation') }
    scope :running, -> { where(stopped_because: nil) }
    scope :finished, -> { where.not(stopped_because: nil) }

    # The runs that make up a report's conversation so far: the latest finished
    # generation and the finished turns after it, oldest first. Runs before that
    # generation are about a report that no longer exists.
    #
    # @return [Array<GenerationTranscript>]
    def self.session_runs_for(report)
      runs = report.generation_transcripts.finished.oldest_first.to_a
      start = runs.rindex(&:generation?)
      return [] if start.nil?

      generation, *revisions = runs[start..]
      kept = [generation]
      budget = MAX_HISTORY_MESSAGES - generation.messages.size
      revisions.reverse_each do |run|
        break if budget < run.messages.size

        kept.insert(1, run)
        budget -= run.messages.size
      end

      kept
    end

    def generation? = kind == 'generation'
    def running? = stopped_because.nil?
    def cancel_requested? = cancel_requested_at.present?

    # The run ended before the model said it was done: what it wrote is saved, and
    # the admin should be told it may be incomplete.
    def stopped_early? = STOPPED_EARLY.include?(stopped_because)

    def rounds
      messages.count { |message| message['role'] == 'assistant' }
    end

    # What the run cost, once the provider's cache is taken into account. A cache read
    # figure of zero on a multi-round run means the prompt is not stable and every
    # round is being paid for in full.
    def cache_read_tokens = usage['cache_read_input_tokens'].to_i
  end
end
