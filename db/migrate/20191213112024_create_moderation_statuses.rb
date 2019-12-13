class CreateModerationStatuses < ActiveRecord::Migration[5.2]
  def change
    create_table :moderation_statuses, id: :uuid do |t|
      t.uuid :moderatable_id
      t.string :moderatable_type
      t.string :status

      t.timestamps
    end

    add_index :moderation_statuses, [:moderatable_type, :moderatable_id], unique: true
  end
end
