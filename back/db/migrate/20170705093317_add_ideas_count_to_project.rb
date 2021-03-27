class AddIdeasCountToProject < ActiveRecord::Migration[5.1]
  def change
    add_column :projects, :ideas_count, :integer, null: false, default: 0
  end
end
