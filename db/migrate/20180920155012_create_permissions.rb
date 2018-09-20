class CreatePermissions < ActiveRecord::Migration[5.1]
  def change
    create_table :permissions, id: :uuid do |t|
      t.string :action, null: false
      t.string :permitted_by, null: false
      t.uuid :participation_context_id, null: false
      t.string :participation_context_type, null: false

      t.timestamps
      t.index [:participation_context_id, :action]
    end
  end
end