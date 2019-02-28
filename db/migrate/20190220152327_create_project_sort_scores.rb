class CreateProjectSortScores < ActiveRecord::Migration[5.2]
  def change
    create_view :project_sort_scores
  end
end
