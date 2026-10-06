# frozen_string_literal: true

class AddLabelsToReportingQuestionAnswers < ActiveRecord::Migration[7.2]
  def change
    replace_view :reporting_user_question_answers, version: 3, revert_to_version: 2
    replace_view :reporting_input_question_answers, version: 3, revert_to_version: 2
  end
end
