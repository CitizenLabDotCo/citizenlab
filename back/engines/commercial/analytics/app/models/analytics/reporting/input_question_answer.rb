# frozen_string_literal: true

# == Schema Information
#
# Table name: reporting_input_question_answers
#
#  input_id       :uuid
#  question_id    :uuid
#  question_key   :string
#  question_type  :string
#  question_label :text
#  value_text     :text
#  value_numeric  :decimal(, )
#
module Analytics
  module Reporting
    class InputQuestionAnswer < Analytics::ApplicationRecordView
      self.table_name = 'reporting_input_question_answers'
      self.primary_key = nil

      def self.table_description
        <<~DOC.squish
          One row per answer to a form question of an input: survey answers and
          extra idea-form fields. Multi-select questions produce one row per
          selected option. Structurally complex question types (ranking,
          matrix, mapping, file upload) are not included. Inputs that skipped a
          question have no row for it.
        DOC
      end

      def self.field_descriptions
        {
          'input_id' => 'The input the answer belongs to. Joins to reporting_inputs.id.',
          'question_id' => 'Id of the form question (custom field). Group on it to aggregate per question.',
          'question_key' => 'Stable machine key of the question within its form.',
          'question_type' => <<~DOC.squish,
            Answer format: 'select', 'select_image', 'multiselect',
            'multiselect_image', 'checkbox', 'text', 'multiline_text', 'date',
            'number', 'linear_scale', 'rating' or 'sentiment_linear_scale'.
          DOC
          'question_label' => 'Question text, resolved to the platform primary locale.',
          'value_text' => <<~DOC.squish,
            Textual answer: the option key for (multi)select questions, free
            text for text questions, 'true'/'false' for checkboxes. NULL for
            numeric question types.
          DOC
          'value_numeric' => <<~DOC.squish
            Numeric answer for 'number', 'linear_scale', 'rating' and
            'sentiment_linear_scale' questions (scales run from 1 upwards).
            Aggregate with AVG for scores. NULL for textual question types.
          DOC
        }
      end
    end
  end
end
