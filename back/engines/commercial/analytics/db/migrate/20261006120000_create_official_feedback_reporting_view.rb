# frozen_string_literal: true

# Grants follow in a separate main-app migration.
class CreateOfficialFeedbackReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_official_feedbacks, version: 1
  end
end
