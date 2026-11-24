# frozen_string_literal: true

# Grants follow in a separate main-app migration.
class CreateInputImportReportingView < ActiveRecord::Migration[7.2]
  def change
    create_view :reporting_input_imports, version: 1
  end
end
