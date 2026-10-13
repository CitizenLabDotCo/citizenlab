# frozen_string_literal: true

# This migration comes from analytics (originally 20261006140000)
# Grants follow in a separate main-app migration.
class CreateEventReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_events, version: 1
    replace_view :reporting_contributions, version: 3, revert_to_version: 2
  end
end
