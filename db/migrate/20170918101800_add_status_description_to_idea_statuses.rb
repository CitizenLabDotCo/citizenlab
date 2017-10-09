class AddStatusDescriptionToIdeaStatuses < ActiveRecord::Migration[5.1]
  def change
    add_column :idea_statuses, :description_multiloc, :jsonb, default: {}
  end
end
