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

      # Create compatibility views so old code referencing original names keeps working
      reversible do |dir|
        dir.up do
          # View for topics table
          execute <<-SQL.squish
            CREATE VIEW topics AS SELECT * FROM global_topics
          SQL

          # View for projects_topics with topic_id alias
          execute <<-SQL.squish
            CREATE VIEW projects_topics AS
            SELECT id, project_id, global_topic_id AS topic_id, created_at, updated_at
            FROM projects_global_topics
          SQL

          # View for static_pages_topics with topic_id alias
          execute <<-SQL.squish
            CREATE VIEW static_pages_topics AS
            SELECT id, static_page_id, global_topic_id AS topic_id, created_at, updated_at
            FROM static_pages_global_topics
          SQL
        end
        dir.down do
          execute <<-SQL.squish
            DROP VIEW IF EXISTS static_pages_topics
          SQL
          execute <<-SQL.squish
            DROP VIEW IF EXISTS projects_topics
          SQL
          execute <<-SQL.squish
            DROP VIEW IF EXISTS topics
          SQL
        end
      end
    end
  end
end
