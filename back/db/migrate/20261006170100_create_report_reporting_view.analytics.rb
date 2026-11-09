# frozen_string_literal: true

# This migration comes from analytics (originally 20261006170000)
# Grants follow in a separate main-app migration.
class CreateReportReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_reports, version: 1
  end
end
