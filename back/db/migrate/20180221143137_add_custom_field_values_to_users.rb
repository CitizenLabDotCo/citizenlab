class AddCustomFieldValuesToUsers < ActiveRecord::Migration[5.1]
  def change
    add_column :users, :custom_field_values, :jsonb, default: {}
  end
end
