# frozen_string_literal: true

# This migration comes from analytics (originally 20261014110000)
# Grants follow in a separate main-app migration.
class CreateEmailDeliveryReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_email_deliveries, version: 1
  end
end
