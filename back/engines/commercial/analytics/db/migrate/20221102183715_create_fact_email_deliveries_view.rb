# frozen_string_literal: true

class CreateFactEmailDeliveriesView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_email_deliveries
  end
end
