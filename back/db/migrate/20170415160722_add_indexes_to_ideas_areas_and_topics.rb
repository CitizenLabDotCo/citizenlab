# frozen_string_literal: true

class AddIndexesToIdeasAreasAndTopics < ActiveRecord::Migration[5.0]
  def change
    add_index(:ideas_topics, %i[idea_id topic_id], unique: true)
    add_index(:areas_ideas, %i[idea_id area_id], unique: true)
  end
end
