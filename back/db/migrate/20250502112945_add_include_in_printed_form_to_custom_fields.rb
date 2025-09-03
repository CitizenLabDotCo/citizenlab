# frozen_string_literal: true

class AddIncludeInPrintedFormToCustomFields < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_fields, :include_in_printed_form, :boolean, default: true, null: false

    # Final page should not be included in printed form by default
    CustomField.where(input_type: 'page', key: 'form_end').update_all(include_in_printed_form: false)
  end
end
