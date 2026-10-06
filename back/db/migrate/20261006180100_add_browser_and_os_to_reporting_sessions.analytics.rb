# frozen_string_literal: true

# This migration comes from analytics (originally 20261006180000)
class AddBrowserAndOsToReportingSessions < ActiveRecord::Migration[7.2]
  def change
    replace_view :reporting_sessions, version: 2, revert_to_version: 1
  end
end
