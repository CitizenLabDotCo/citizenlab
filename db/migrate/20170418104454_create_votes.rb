class CreateVotes < ActiveRecord::Migration[5.0]
  def change
    create_table :votes, id: :uuid do |t|
      t.uuid :votable_id
      t.string  :votable_type
      t.references :user, foreign_key: true, type: :uuid
      t.integer :mode, null: false

      t.timestamps
    end

    add_index :votes, [:votable_type, :votable_id]
  end
end
