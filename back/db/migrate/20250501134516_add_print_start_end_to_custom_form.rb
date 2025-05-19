# frozen_string_literal: true

class AddPrintStartEndToCustomForm < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_forms, :fields_last_updated_at, :datetime, default: -> { 'NOW()' }, null: false
    add_column :custom_forms, :print_start_multiloc, :jsonb, default: {}, null: false
    add_column :custom_forms, :print_end_multiloc, :jsonb, default: {}, null: false

    CustomForm.update_all('fields_last_updated_at = updated_at')
  end
end
