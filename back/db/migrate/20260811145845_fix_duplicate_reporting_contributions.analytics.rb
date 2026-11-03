# frozen_string_literal: true

# This migration comes from analytics (originally 20260811090000)
class FixDuplicateReportingContributions < ActiveRecord::Migration[7.2]
  def change
    replace_view :reporting_contributions, version: 2, revert_to_version: 1
  end
end
