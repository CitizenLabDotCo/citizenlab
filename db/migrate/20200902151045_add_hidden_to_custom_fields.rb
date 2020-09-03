class AddHiddenToCustomFields < ActiveRecord::Migration[6.0]
  def change
    add_column :custom_fields, :hidden, :boolean, null: false, default: false
  end
end
