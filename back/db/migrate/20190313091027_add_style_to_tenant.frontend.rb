# This migration comes from frontend (originally 20190313085934)
class AddStyleToTenant < ActiveRecord::Migration[5.2]
  def change
    add_column :tenants, :style, :jsonb, default: {}
  end
end
