# frozen_string_literal: true

# == Schema Information
#
# Table name: ai_assistant_runs
#
#  id                  :uuid             not null, primary key
#  conversation_id     :uuid             not null
#  kind                :string           default(""), not null
#  model               :string           default(""), not null
#  usage               :jsonb            not null
#  stopped_because     :string
#  cancel_requested_at :datetime
#  applied_at          :datetime
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#
# Indexes
#
#  index_ai_assistant_runs_on_conversation_id  (conversation_id)
#
# Foreign Keys
#
#  fk_rails_...  (conversation_id => ai_assistant_conversations.id) ON DELETE => cascade
#
module AIAssistant
  # One run of the model on a conversation's subject: the report builder's first
  # generation, or one turn of its chat.
  #
  # A run is minutes of paid work behind a background job with nobody watching. When
  # one produces a disappointing result, or none at all, its messages are the only way
  # to tell a bad prompt from a bad reply from a broken tool — everything else the run
  # leaves behind is the outcome, not the reasoning.
  #
  # The messages live in the conversation, written as they happen, so a run that dies
  # still leaves what it did. This row holds what only a run has: why it was started,
  # its cost, why it stopped, and whether its work was applied. It is created when the
  # run starts, so a run that is still going has a record: the cancel endpoint marks
  # it, and what the run writes points back at it.
  #
  # +kind+ and the surface's reading of a run are the surface's own; what is here is
  # true of any run.
  class Run < ApplicationRecord
    STOP_REASONS = %w[done round_cap timeout cancelled failed].freeze
    # The run ended before the model said it was done: what it wrote is kept, and
    # whoever asked should be told it may be incomplete.
    STOPPED_EARLY = %w[round_cap timeout cancelled].freeze

    belongs_to :conversation, class_name: 'AIAssistant::Conversation'
    # Nullify, not destroy: a run's messages are the conversation's history, and they
    # outlive the run that wrote them.
    has_many :messages, -> { order(:position) }, class_name: 'AIAssistant::Message',
      dependent: :nullify, inverse_of: :run

    validates :stopped_because, inclusion: { in: STOP_REASONS }, allow_nil: true

    scope :newest_first, -> { order(created_at: :desc) }
    scope :oldest_first, -> { order(created_at: :asc) }
    scope :running, -> { where(stopped_because: nil) }
    scope :finished, -> { where.not(stopped_because: nil) }
    scope :not_failed, -> { where.not(stopped_because: 'failed') }
    scope :applied, -> { where.not(applied_at: nil) }

    # Adds a message to the conversation as part of this run.
    #
    # Under the conversation's lock, because a message is numbered by reading the
    # highest position so far, and a person's next message can arrive from a web
    # request while this run is writing.
    def append_message!(**attributes)
      conversation.with_lock { conversation.messages.create!(run: self, **attributes) }
    end

    # This run's work is what the subject holds, as opposed to a run that stopped for
    # a respectable reason and still wrote nothing.
    def applied? = applied_at.present?

    # Called once the work this run produced has been written. Best effort: it is
    # already written by this point, and failing the job over a bookkeeping row would
    # rerun minutes of paid work to fix it.
    def applied!
      update!(applied_at: Time.current)
    rescue StandardError => e
      ErrorReporter.report(e, extra: { run_id: id })
    end

    def running? = stopped_because.nil?
    def cancel_requested? = cancel_requested_at.present?
    def stopped_early? = STOPPED_EARLY.include?(stopped_because)

    def rounds = messages.where(role: 'assistant').count

    # What the run cost, once the provider's cache is taken into account. A cache read
    # figure of zero on a multi-round run means the prompt is not stable and every
    # round is being paid for in full.
    def cache_read_tokens = usage['cache_read_input_tokens'].to_i
  end
end
