# frozen_string_literal: true

class UpdateFactEmailDeliveriesViewV2 < ActiveRecord::Migration[6.1]
  def change
    update_view :analytics_fact_email_deliveries, version: 2, revert_to_version: 1
  end
end
