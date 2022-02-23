class RenameProjectsTopicsToProjectsAllowedInputTopics < ActiveRecord::Migration[6.1]
  def change
    rename_table :projects_topics, :projects_allowed_input_topics
  end
end
