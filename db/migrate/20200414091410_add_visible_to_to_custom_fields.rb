class AddVisibleToToCustomFields < ActiveRecord::Migration[6.0]
  def change
    add_column :custom_fields, :visible_to, :string, null: false, default: 'public'
  end
end
