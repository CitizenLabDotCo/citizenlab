class CreateJoinTableLabsTopics < ActiveRecord::Migration[5.0]
  def change
    create_join_table :labs, :topics do |t|
      t.index :lab_id
      t.index :topic_id
    end
  end
end
