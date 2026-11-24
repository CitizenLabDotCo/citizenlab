# frozen_string_literal: true

# This migration comes from analytics (originally 20261014100000)
# Grants follow in a separate main-app migration.
class CreateStaffActivityReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_staff_activities, version: 1
  end
end
