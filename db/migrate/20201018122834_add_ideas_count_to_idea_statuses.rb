class AddIdeasCountToIdeaStatuses < ActiveRecord::Migration[6.0]
  def up
    add_column :idea_statuses, :ideas_count, :integer, default: 0
    build_counters
  end

  def down
    remove_column :idea_statuses, :ideas_count, :integer
  end

  def build_counters
    Idea.counter_culture_fix_counts only: :idea_status
  end
end
