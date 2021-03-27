class AddImagesToTenant < ActiveRecord::Migration[5.0]
  def change
    add_column :tenants, :logo, :string
    add_column :tenants, :header_bg, :string
  end
end
