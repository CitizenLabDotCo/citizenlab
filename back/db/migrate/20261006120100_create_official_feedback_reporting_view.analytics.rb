# frozen_string_literal: true

# This migration comes from analytics (originally 20261006120000)
# Grants follow in a separate main-app migration.
class CreateOfficialFeedbackReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_official_feedbacks, version: 1
  end
end
