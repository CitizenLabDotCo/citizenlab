class AddIndexToIdeasOnCreationPhaseId < ActiveRecord::Migration[7.2]
  def change
    add_index :ideas, :creation_phase_id
  end
end
