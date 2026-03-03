class AddSpaceToProjects < ActiveRecord::Migration[7.2]
  def change
    safety_assured do
      add_reference :projects, :space, type: :uuid, foreign_key: true, index: true
    end
  end
end
