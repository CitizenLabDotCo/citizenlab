class AddCreatedAtIndexToProjects < ActiveRecord::Migration[5.1]
  def change
    add_index :projects, :created_at, order: :desc
  end
end
