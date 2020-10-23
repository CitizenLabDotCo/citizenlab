class ChangeDefaultValueIdeasOrderToNull < ActiveRecord::Migration[6.0]
  def change
    change_column_default :projects, :ideas_order, nil
    change_column_default :phases, :ideas_order, nil
  end
end
