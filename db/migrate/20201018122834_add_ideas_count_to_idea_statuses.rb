class AddIdeasCountToIdeaStatuses < ActiveRecord::Migration[6.0]
  def change
    add_column :idea_statuses, :ideas_count, :integer, default: 0
  end
end
