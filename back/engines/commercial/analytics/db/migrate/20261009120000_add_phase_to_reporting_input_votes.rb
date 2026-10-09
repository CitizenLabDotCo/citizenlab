# frozen_string_literal: true

class AddPhaseToReportingInputVotes < ActiveRecord::Migration[7.2]
  def up
    replace_view :reporting_input_votes, version: 2
  end

  # replace_view can append columns but not remove them, so rolling back
  # drops and recreates the old version instead. That loses analytics_reader's
  # grant: re-run `rake mcp_server:reprovision_analytics_reader` afterwards.
  def down
    update_view :reporting_input_votes, version: 1
  end
end
