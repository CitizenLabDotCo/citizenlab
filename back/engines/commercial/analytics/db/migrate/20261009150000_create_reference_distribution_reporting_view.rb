# frozen_string_literal: true

# Grants follow in a separate main-app migration.
class CreateReferenceDistributionReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_reference_distributions, version: 1
  end
end
