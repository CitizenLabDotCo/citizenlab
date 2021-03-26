class AddIndexesToIdeasAreasAndTopics < ActiveRecord::Migration[5.0]
  def change
    add_index(:ideas_topics, [:idea_id, :topic_id], unique: true)
    add_index(:areas_ideas, [:idea_id, :area_id], unique: true)
  end
end
