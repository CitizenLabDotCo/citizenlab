class AddPageButtonAttributesToCustomFields < ActiveRecord::Migration[7.1]
  def change
    add_column :custom_fields, :page_button_label_multiloc, :jsonb, null: false, default: {}
    add_column :custom_fields, :page_button_link, :string
  end
end
