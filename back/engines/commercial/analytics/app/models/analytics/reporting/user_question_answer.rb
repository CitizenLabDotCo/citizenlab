# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_user_question_answers
#
#  user_id        :uuid
#  question_id    :uuid
#  question_key   :string
#  question_type  :string
#  question_label :text
#  answer_value   :text
#
module Analytics
  module Reporting
    class UserQuestionAnswer < Analytics::ApplicationRecordView
      self.table_name = 'reporting_user_question_answers'
      self.primary_key = nil

      def self.table_description
        <<~DOC.squish
          One row per answer an active user gave to an enabled registration
          question. This is where demographics live (age, gender, place of
          residence, ...). Multi-select questions produce one row per selected
          option. Users who did not answer a question have no row for it:
          compute unknown counts against reporting_users.
        DOC
      end

      def self.field_descriptions
        {
          'user_id' => 'The user who answered. Joins to reporting_users.id.',
          'question_id' => 'Id of the registration question (custom field).',
          'question_key' => "Stable machine key of the question, for example 'gender', 'birthyear' or 'domicile'.",
          'question_type' => "Answer format: 'select', 'multiselect', 'checkbox' or 'number'.",
          'question_label' => 'Question text, resolved to the platform primary locale.',
          'answer_value' => <<~DOC.squish
            The answer as raw text: the option key for (multi)select questions
            (for 'domicile' this is a geographic area id), a year for
            'birthyear', 'true'/'false' for checkboxes, a number as text for
            number questions (cast with ::numeric to aggregate).
          DOC
        }
      end
    end
  end
end
