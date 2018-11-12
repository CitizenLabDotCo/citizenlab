class CreateBaskets < ActiveRecord::Migration[5.1]
  def change
    create_table :baskets, id: :uuid do |t|
      t.timestamp :submitted_at
      t.references :user, foreign_key: true, type: :uuid, index: true
      t.uuid :participation_context_id
      t.string  :participation_context_type

      t.timestamps
    end
  end
end
