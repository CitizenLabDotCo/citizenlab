# frozen_string_literal: true

# Grants follow in a separate main-app migration.
class CreateInputStatusChangeReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_input_status_changes, version: 1
  end
end
