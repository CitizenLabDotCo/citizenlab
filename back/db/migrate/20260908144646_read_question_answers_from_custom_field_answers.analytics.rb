# frozen_string_literal: true

# This migration comes from analytics (originally 20260908080000)
class ReadQuestionAnswersFromCustomFieldAnswers < ActiveRecord::Migration[7.2]
  def change
    replace_view :reporting_user_question_answers, version: 2, revert_to_version: 1
    replace_view :reporting_input_question_answers, version: 2, revert_to_version: 1
  end
end
