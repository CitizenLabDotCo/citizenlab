# frozen_string_literal: true

# This migration comes from analytics (originally 20261006090000)
class AddLabelsToReportingQuestionAnswers < ActiveRecord::Migration[7.2]
  def up
    replace_view :reporting_user_question_answers, version: 3
    replace_view :reporting_input_question_answers, version: 3
  end

  # replace_view can append columns but not remove them, so rolling back
  # drops and recreates the old version instead. That loses analytics_reader's
  # grant: re-run `rake mcp_server:reprovision_analytics_reader` afterwards.
  def down
    update_view :reporting_input_question_answers, version: 2
    update_view :reporting_user_question_answers, version: 2
  end
end
