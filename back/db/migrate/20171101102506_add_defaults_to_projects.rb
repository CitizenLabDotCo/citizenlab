class AddDefaultsToProjects < ActiveRecord::Migration[5.1]
  def change
    change_column_default :projects, :title_multiloc, {}
    change_column_default :projects, :description_multiloc, {}
    Project.where(description_multiloc: nil).update_all(description_multiloc: {})
    Project.where(title_multiloc: nil).update_all(description_multiloc: {})
  end
end
