# frozen_string_literal: true

# This migration comes from analytics (originally 20221102183715)
class CreateFactEmailDeliveriesView < ActiveRecord::Migration[6.1]
  def change
    create_view :analytics_fact_email_deliveries
  end
end
