# frozen_string_literal: true

class AddPrintPersonalDataFieldsToCustomForm < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_forms, :print_personal_data_fields, :boolean, default: false, null: false
  end
end
