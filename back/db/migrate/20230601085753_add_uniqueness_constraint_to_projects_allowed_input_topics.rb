# frozen_string_literal: true

class AddUniquenessConstraintToProjectsAllowedInputTopics < ActiveRecord::Migration[6.1]
  def change
    execute(
      # After https://stackoverflow.com/a/12963112/3585671
      <<-SQL.squish
      DELETE FROM projects_allowed_input_topics to_delete USING (
        SELECT MIN(id::text) AS id, topic_id, project_id
          FROM projects_allowed_input_topics 
          GROUP BY (topic_id, project_id) HAVING COUNT(*) > 1
        ) keep_from_duplicates
        WHERE to_delete.topic_id = keep_from_duplicates.topic_id
        AND to_delete.project_id = keep_from_duplicates.project_id
        AND to_delete.id::text <> keep_from_duplicates.id
      SQL
    )
    remove_index :projects_allowed_input_topics, name: :index_projects_allowed_input_topics_on_topic_id
    add_index :projects_allowed_input_topics, %i[topic_id project_id], unique: true
  end
end
