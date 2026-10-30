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
  # survey of a phase. +surface_key+ says where the assistant is used, which decides its prompt.
  class Conversation < ApplicationRecord
    STATUSES = %w[idle running failed].freeze
    # A running turn stores a message more often than this, unless its job was lost.
    TURN_TIMEOUT = 10.minutes

    belongs_to :user
    belongs_to :subject, polymorphic: true

    has_many :messages, -> { order(:position) }, class_name: 'AIAssistant::Message', dependent: :destroy, inverse_of: :conversation

    enum :status, STATUSES.index_by(&:itself)

    validates :surface_key, :locale, presence: true

    # Gets the conversation out of a state that nothing would end anymore.
    def recover_if_stuck!
      return unless running? && updated_at < TURN_TIMEOUT.ago

      update!(status: 'failed', last_error_code: 'turn_timed_out')
    end
  end
end
