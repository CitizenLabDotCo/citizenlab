# frozen_string_literal: true

# This migration comes from analytics (originally 20261014130000)
# Grants follow in a separate main-app migration.
class CreateRegistrationReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_registrations, version: 1
  end
end
