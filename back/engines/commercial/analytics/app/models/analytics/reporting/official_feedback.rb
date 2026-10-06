# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_official_feedbacks
#
#  id         :uuid             primary key
#  input_id   :uuid
#  body       :text
#  author     :text
#  user_id    :uuid
#  created_at :datetime
#  updated_at :datetime
#
module Analytics
  module Reporting
    class OfficialFeedback < Analytics::ApplicationRecordView
      self.table_name = 'reporting_official_feedbacks'
      self.primary_key = :id

      def self.table_description
        <<~DOC.squish
          One row per official feedback: a public update an administrator
          posted on an input to tell participants what happened with it. An
          input can have several, so order by created_at to tell the story.
          Status changes without a written update are not included (see
          reporting_inputs.received_feedback).
        DOC
      end

      def self.field_descriptions
        {
          'id' => 'Primary key.',
          'input_id' => 'The input the feedback was posted on.',
          'body' => <<~DOC.squish,
            The feedback text, resolved to the platform primary locale. Stored
            as sanitized HTML (paragraphs, lists, bold, ...): strip the tags
            before quoting it.
          DOC
          'author' => <<~DOC.squish,
            The signature shown to participants, resolved to the platform
            primary locale. Free text chosen by the poster, often a department
            or role (for example "City council").
          DOC
          'user_id' => <<~DOC.squish,
            The staff member who posted the feedback, or NULL when that user was
            deleted. Can point to a user missing from reporting_users (blocked or
            not fully registered), so LEFT JOIN to keep all feedback; use author
            to name the poster.
          DOC
          'created_at' => 'When the feedback was posted (UTC).',
          'updated_at' => 'When the feedback was last edited (UTC).'
        }
      end

      def self.foreign_keys
        {
          'input_id' => 'reporting_inputs.id',
          'user_id' => 'reporting_users.id'
        }
      end
    end
  end
end
