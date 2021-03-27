class CreateNotifications < ActiveRecord::Migration[5.0]
  def change
    create_table :notifications, id: :uuid do |t|
      t.string :type
      t.datetime :read_at, allow_nil: true, default: nil
      t.references :recipient, foreign_key: { to_table: :users }, type: :uuid
      t.string :user_id, allow_nil: true
      t.string :idea_id, allow_nil: true
      t.string :comment_id, allow_nil: true
      t.string :project_id, allow_nil: true

      t.timestamps
    end
    add_index(:notifications, [:recipient_id, :read_at])
    add_index(:notifications, :created_at)
  end
end
