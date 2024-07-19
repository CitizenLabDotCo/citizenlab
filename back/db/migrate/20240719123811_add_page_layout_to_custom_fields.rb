class AddPageLayoutToCustomFields < ActiveRecord::Migration[7.0]
  def change
    add_column :custom_fields, :page_layout, :string
  end
end
