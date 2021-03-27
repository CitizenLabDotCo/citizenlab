class CreateJoinTableInitiativesTopics < ActiveRecord::Migration[5.2]
  def change
    create_table :initiatives_topics, id: :uuid do |t|
      t.references :initiative, foreign_key: true, type: :uuid, index: true
      t.references :topic, foreign_key: true, type: :uuid, index: true
    end

    add_index :initiatives_topics, [:initiative_id, :topic_id], unique: true
  end
end
