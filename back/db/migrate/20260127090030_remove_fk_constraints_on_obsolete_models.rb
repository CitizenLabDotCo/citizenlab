class RemoveFkConstraintsOnObsoleteModels < ActiveRecord::Migration[7.2]
  def change
    remove_foreign_key :projects_allowed_input_topics, :projects, if_exists: true
    remove_foreign_key :projects_allowed_input_topics, :global_topics, if_exists: true
  end
end
