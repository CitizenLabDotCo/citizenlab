class AddStyleToTenant < ActiveRecord::Migration[5.2]
  def change
    add_column :tenants, :style, :jsonb, default: {}
  end
end
