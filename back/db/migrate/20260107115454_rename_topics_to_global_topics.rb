# frozen_string_literal: true

class RenameTopicsToGlobalTopics < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      # Rename main table
      rename_table :topics, :global_topics

      # Rename join tables for use case A (project categorization)
      rename_table :projects_topics, :projects_global_topics
      rename_table :static_pages_topics, :static_pages_global_topics

      # Update foreign key column names in renamed join tables
      rename_column :projects_global_topics, :topic_id, :global_topic_id
      rename_column :static_pages_global_topics, :topic_id, :global_topic_id

      # Update polymorphic followers to reference new model name
      reversible do |dir|
        dir.up do
          execute <<-SQL.squish
            UPDATE followers SET followable_type = 'GlobalTopic' WHERE followable_type = 'Topic'
          SQL
        end
        dir.down do
          execute <<-SQL.squish
            UPDATE followers SET followable_type = 'Topic' WHERE followable_type = 'GlobalTopic'
          SQL
        end
      end
    end
  end
end
