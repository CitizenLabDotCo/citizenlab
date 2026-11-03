# frozen_string_literal: true

# This migration comes from analytics (originally 20261009110000)
# Grants follow in a separate main-app migration.
class CreateInputPhaseReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_input_phases, version: 1
  end
end
