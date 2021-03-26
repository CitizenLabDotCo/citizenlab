class CreateJoinTableIdeasTopics < ActiveRecord::Migration[5.0]
  def change
    create_table :ideas_topics, id: false do |t|
      t.references :idea, foreign_key: true, type: :uuid, index: true
      t.references :topic, foreign_key: true, type: :uuid, index: true
    end
  end
end
