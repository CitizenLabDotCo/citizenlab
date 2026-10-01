# frozen_string_literal: true

# == Schema Information
#
# Table name: report_builder_report_chats
#
#  id         :uuid             not null, primary key
#  report_id  :uuid             not null
#  transcript :jsonb            not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_report_chats_on_report_id  (report_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (report_id => report_builder_reports.id) ON DELETE => cascade
#
module ReportBuilder
  # The conversation in which an admin asks for changes to a report, and the record
  # of what was asked and what the model did about it.
  #
  # One per report. The transcript is the model conversation itself — user turns and
  # assistant turns with their tool calls — so a revision continues where the last
  # one stopped instead of re-reading the whole report from scratch.
  class ReportChat < ::ApplicationRecord
    # Every turn is a model call, and the transcript is resent in full each time. Past
    # this the oldest turns are dropped rather than letting one report's chat grow
    # without bound.
    MAX_MESSAGES = 120

    belongs_to :report, class_name: 'ReportBuilder::Report', inverse_of: :chat

    validate :validate_transcript

    # The turns to send to the model: the tail that fits, always starting on a user
    # turn so the conversation the model sees is well formed.
    def messages_for_model
      kept = transcript.last(MAX_MESSAGES)
      kept = kept.drop(1) until kept.empty? || kept.first['role'] == 'user'
      kept
    end

    private

    def validate_transcript
      return if transcript.is_a?(Array)

      errors.add :transcript, :invalid, message: 'must be a JSON array'
    end
  end
end
