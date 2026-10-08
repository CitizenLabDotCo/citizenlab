# frozen_string_literal: true

# == Schema Information
#
# Table name: ai_assistant_tool_calls
#
#  id              :uuid             not null, primary key
#  message_id      :uuid             not null
#  tool_use_id     :string           not null
#  name            :string           not null
#  arguments       :jsonb            not null
#  bound_arguments :jsonb            not null
#  status          :string           not null
#  result          :text
#  decided_by_id   :uuid
#  decided_at      :datetime
#  reason          :text
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_ai_assistant_tool_calls_on_decided_by_id  (decided_by_id)
#  index_ai_assistant_tool_calls_on_message_id     (message_id)
#
# Foreign Keys
#
#  fk_rails_...  (decided_by_id => users.id) ON DELETE => nullify
#  fk_rails_...  (message_id => ai_assistant_messages.id) ON DELETE => cascade
#
module AIAssistant
  # A tool call made by the model. The tool runs right away.
  class ToolCall < ApplicationRecord
    STATUSES = %w[pending auto_executed failed].freeze

    belongs_to :message, class_name: 'AIAssistant::Message', inverse_of: :tool_calls

    enum :status, STATUSES.index_by(&:itself)

    validates :tool_use_id, :name, presence: true

    delegate :conversation, to: :message

    # What the model gets back as the result of this call.
    def result_for_llm
      result.presence || { error: 'The tool call was interrupted.' }.to_json
    end
  end
end
