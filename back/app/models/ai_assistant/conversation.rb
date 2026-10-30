# frozen_string_literal: true

# == Schema Information
#
# Table name: ai_assistant_conversations
#
#  id              :uuid             not null, primary key
#  user_id         :uuid             not null
#  subject_type    :string           not null
#  subject_id      :uuid             not null
#  surface_key     :string           not null
#  locale          :string           not null
#  status          :string           default("idle"), not null
#  last_error_code :string
#  turn_started_at :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_ai_assistant_conversations_on_subject  (subject_type,subject_id)
#  index_ai_assistant_conversations_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id) ON DELETE => cascade
#
module AIAssistant
  # A chat between a user and the AI assistant about one record (the subject), e.g. the
  # survey of a phase. +surface_key+ says where the assistant is used, which decides its
  # prompt and tools.
  class Conversation < ApplicationRecord
    STATUSES = %w[idle running awaiting_approval failed].freeze
    # A running turn stores a message more often than this, unless its job was lost.
    TURN_TIMEOUT = 10.minutes

    belongs_to :user
    belongs_to :subject, polymorphic: true

    has_many :messages, -> { order(:position) }, class_name: 'AIAssistant::Message', dependent: :destroy, inverse_of: :conversation
    has_many :tool_calls, through: :messages

    enum :status, STATUSES.index_by(&:itself)

    validates :surface_key, :locale, presence: true

    # Calls still pending when a turn fails never ran: the tool-call limit or a stopped
    # worker cut the turn off before their tool did.
    def fail_turn!(error_code)
      tool_calls.pending.find_each { |tool_call| tool_call.update!(status: 'failed') }
      update!(status: 'failed', last_error_code: error_code)
    end

    # Gets the conversation out of a state that nothing would end anymore: a turn whose job
    # was lost, an approved change whose request died, or proposals nobody decided on.
    def recover_if_stuck!
      if running?
        fail_turn!('turn_timed_out') if updated_at < TURN_TIMEOUT.ago
      elsif awaiting_approval?
        recover_stuck_decisions!
      end
    end

    # The proposals can no longer be decided on: the model will see them as expired.
    def expire_proposals!
      transaction do
        tool_calls.proposed.find_each do |tool_call|
          tool_call.update!(status: 'expired', result: { expired: true }.to_json)
        end
        update!(status: 'idle') if awaiting_approval?
      end
    end

    private

    def recover_stuck_decisions!
      return unless tool_calls.interrupted_approvals.exists? || tool_calls.overdue_proposals.exists?

      transaction do
        tool_calls.interrupted_approvals.find_each { |tool_call| tool_call.update!(status: 'failed') }
        expire_proposals! if tool_calls.overdue_proposals.exists?
        update!(status: 'idle') if tool_calls.where(status: ToolCall::UNDECIDED_STATUSES).none?
      end
    end
  end
end
