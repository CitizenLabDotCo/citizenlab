class CreatePermissionsGroups < ActiveRecord::Migration[5.1]
  def change
    create_table :permissions_groups, id: :uuid do |t|
      t.reference :permission
      t.reference :group

      t.timestamps
    end
  end
end
