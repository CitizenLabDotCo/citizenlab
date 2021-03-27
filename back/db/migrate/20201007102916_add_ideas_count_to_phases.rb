class AddIdeasCountToPhases < ActiveRecord::Migration[6.0]
  def change
    add_column :phases, :ideas_count, :integer, null: false, default: 0
  end
end
