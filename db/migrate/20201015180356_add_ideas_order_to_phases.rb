class AddIdeasOrderToPhases < ActiveRecord::Migration[6.0]
  def change
    add_column :phases, :ideas_order, :integer, default: 0
  end
end
