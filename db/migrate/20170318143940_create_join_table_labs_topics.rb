class CreateJoinTableLabsTopics < ActiveRecord::Migration[5.0]
  def change
    create_table :labs_topics, id: false do |t|
      t.references :lab, foreign_key: true, type: :uuid, index: true
      t.references :topic, foreign_key: true, type: :uuid, index: true
    end
  end
end
