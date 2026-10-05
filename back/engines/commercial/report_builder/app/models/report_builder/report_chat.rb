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
  # The conversation in which an admin asks for changes to a report, as the admin
  # sees it: what was asked, what the model answered, and whether the report changed.
  #
  # One per report. This is the panel's record, not the model's. What the model is
  # sent on a turn is the report's runs read back in order (GenerationTranscript),
  # tool calls included, so a revision continues where the last one stopped.
  class ReportChat < ::ApplicationRecord
    belongs_to :report, class_name: 'ReportBuilder::Report', inverse_of: :chat

    validate :validate_transcript

    private

    def validate_transcript
      return if transcript.is_a?(Array)

      errors.add :transcript, :invalid, message: 'must be a JSON array'
    end
  end
end
