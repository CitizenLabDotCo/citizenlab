class AddFaviconToTenants < ActiveRecord::Migration[5.1]
  def change
    add_column :tenants, :favicon, :string
  end
end
