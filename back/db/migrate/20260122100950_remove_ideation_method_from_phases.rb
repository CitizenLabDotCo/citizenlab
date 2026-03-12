class RemoveIdeationMethodFromPhases < ActiveRecord::Migration[7.2]
  def change
    safety_assured { remove_column :phases, :ideation_method, :string }
  end
end
