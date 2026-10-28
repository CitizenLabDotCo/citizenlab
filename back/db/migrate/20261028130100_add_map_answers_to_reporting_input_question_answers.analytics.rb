# frozen_string_literal: true

# This migration comes from analytics (originally 20261028130000)
class AddMapAnswersToReportingInputQuestionAnswers < ActiveRecord::Migration[7.2]
  def up
    replace_view :reporting_input_question_answers, version: 5
  end

  # replace_view can append columns but not remove them, so rolling back
  # drops and recreates the old version instead. reporting_community_monitor_scores
  # selects from this view, so it is dropped and recreated around it. Both lose
  # analytics_reader's grant: re-run `rake mcp_server:reprovision_analytics_reader`
  # afterwards.
  def down
    drop_view :reporting_community_monitor_scores
    update_view :reporting_input_question_answers, version: 4
    create_view :reporting_community_monitor_scores, version: 1
  end
end
