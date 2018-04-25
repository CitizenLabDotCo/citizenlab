class ChangeOrderingOfProjects < ActiveRecord::Migration[5.1]
  def change
  	Project.order(ordering: :desc).each.with_index do |project, index|
      project.update_column :ordering, index
    end
  end
end
