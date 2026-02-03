# frozen_string_literal: true

class AddNestedSetColumnsToInputTopics < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    # InputTopic nested set columns
    safety_assured do
      add_column :input_topics, :parent_id, :uuid
      add_column :input_topics, :lft, :integer
      add_column :input_topics, :rgt, :integer
      add_column :input_topics, :depth, :integer, default: 0
      add_column :input_topics, :children_count, :integer, default: 0
    end

    add_index :input_topics, :parent_id, algorithm: :concurrently
    add_index :input_topics, :rgt, algorithm: :concurrently

    # DefaultInputTopic nested set columns
    safety_assured do
      add_column :default_input_topics, :parent_id, :uuid
      add_column :default_input_topics, :lft, :integer
      add_column :default_input_topics, :rgt, :integer
      add_column :default_input_topics, :depth, :integer, default: 0
      add_column :default_input_topics, :children_count, :integer, default: 0
    end

    add_index :default_input_topics, :parent_id, algorithm: :concurrently
    add_index :default_input_topics, :rgt, algorithm: :concurrently
  end
end
