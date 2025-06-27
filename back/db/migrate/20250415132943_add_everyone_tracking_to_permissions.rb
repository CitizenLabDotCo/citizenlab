class AddEveryoneTrackingToPermissions < ActiveRecord::Migration[7.1]
  def change
    add_column :permissions, :everyone_tracking_enabled, :boolean, default: false, null: false
  end
end
