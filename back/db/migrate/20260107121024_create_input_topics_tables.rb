# frozen_string_literal: true

class CreateInputTopicsTables < ActiveRecord::Migration[7.2]
  def change
    # Default input topics - platform-level templates for input topics
    create_table :default_input_topics, id: :uuid do |t|
      t.jsonb :title_multiloc, null: false, default: {}
      t.jsonb :description_multiloc, null: false, default: {}
      t.string :icon
      t.integer :ordering, null: false, default: 0
      t.timestamps
    end

    # Input topics - project-level topics for tagging ideas
    create_table :input_topics, id: :uuid do |t|
      t.references :project, type: :uuid, null: false, foreign_key: true, index: true
      t.jsonb :title_multiloc, null: false, default: {}
      t.jsonb :description_multiloc, null: false, default: {}
      t.string :icon
      t.integer :ordering, null: false, default: 0
      t.timestamps
    end

    add_index :input_topics, %i[project_id ordering]

    # Join table for ideas and input topics
    create_table :ideas_input_topics, id: :uuid do |t|
      t.references :idea, type: :uuid, null: false, foreign_key: true
      t.references :input_topic, type: :uuid, null: false, foreign_key: true
      t.timestamps
    end

    add_index :ideas_input_topics, %i[idea_id input_topic_id], unique: true
  end
end
