class ChangeIdeasOrderColumnTypes < ActiveRecord::Migration[6.0]
  def change
    change_column :projects, :ideas_order, :string, default: 'trending'
    change_column :phases, :ideas_order, :string, default: 'trending'
  end
end
