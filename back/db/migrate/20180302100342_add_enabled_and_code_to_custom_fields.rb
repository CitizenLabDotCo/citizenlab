class AddEnabledAndCodeToCustomFields < ActiveRecord::Migration[5.1]
  def change
    add_column :custom_fields, :enabled, :boolean, default: true, null: false
    add_column :custom_fields, :code, :string
  end
end
