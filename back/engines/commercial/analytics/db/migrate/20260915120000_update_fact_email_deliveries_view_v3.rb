# frozen_string_literal: true

class UpdateFactEmailDeliveriesViewV3 < ActiveRecord::Migration[7.2]
  def change
    update_view :analytics_fact_email_deliveries, version: 3, revert_to_version: 2
  end
end
