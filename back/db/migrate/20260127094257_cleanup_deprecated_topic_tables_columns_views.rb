# frozen_string_literal: true

class CleanupDeprecatedTopicTablesColumnsViews < ActiveRecord::Migration[7.2]
  def up
    safety_assured do
      # Drop compatibility views created during the topics -> global_topics rename
      execute 'DROP VIEW IF EXISTS topics'
      execute 'DROP VIEW IF EXISTS projects_topics'
      execute 'DROP VIEW IF EXISTS static_pages_topics'

      # Drop foreign keys on ideas_topics before dropping the table
      remove_foreign_key :ideas_topics, :ideas, if_exists: true
      remove_foreign_key :ideas_topics, :global_topics, column: :topic_id, if_exists: true

      # Drop deprecated tables
      drop_table :ideas_topics, if_exists: true
      drop_table :projects_allowed_input_topics, if_exists: true

      # Remove deprecated columns
      remove_column :input_topics, :ordering, if_exists: true
      remove_column :default_input_topics, :ordering, if_exists: true
      remove_column :global_topics, :is_default, if_exists: true
    end
  end

  def down
    # Recreate columns
    add_column :global_topics, :is_default, :boolean, default: false, null: false unless column_exists?(:global_topics, :is_default)
    add_column :input_topics, :ordering, :integer, default: 0, null: false unless column_exists?(:input_topics, :ordering)
    add_column :default_input_topics, :ordering, :integer, default: 0, null: false unless column_exists?(:default_input_topics, :ordering)
    # Recreate projects_allowed_input_topics table
    unless table_exists?(:projects_allowed_input_topics)
      create_table :projects_allowed_input_topics, id: :uuid do |t|
        t.uuid :project_id
        t.uuid :topic_id
        t.integer :ordering
        t.timestamps
      end
      add_index :projects_allowed_input_topics, :project_id
      add_index :projects_allowed_input_topics, %i[topic_id project_id], unique: true
    end

    # Recreate ideas_topics table
    unless table_exists?(:ideas_topics)
      create_table :ideas_topics, id: :uuid do |t|
        t.uuid :idea_id
        t.uuid :topic_id
        t.timestamps
      end
      add_index :ideas_topics, :idea_id
      add_index :ideas_topics, :topic_id
      add_index :ideas_topics, %i[idea_id topic_id], unique: true
      add_foreign_key :ideas_topics, :ideas
      add_foreign_key :ideas_topics, :global_topics, column: :topic_id
    end

    # Recreate compatibility views
    execute <<-SQL.squish
      CREATE VIEW topics AS SELECT * FROM global_topics
    SQL

    execute <<-SQL.squish
      CREATE VIEW projects_topics AS
      SELECT id, project_id, global_topic_id AS topic_id, created_at, updated_at
      FROM projects_global_topics
    SQL

    execute <<-SQL.squish
      CREATE VIEW static_pages_topics AS
      SELECT id, static_page_id, global_topic_id AS topic_id, created_at, updated_at
      FROM static_pages_global_topics
    SQL
  end
end
