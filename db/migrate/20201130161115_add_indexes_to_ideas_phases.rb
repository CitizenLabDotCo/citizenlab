class AddIndexesToIdeasPhases < ActiveRecord::Migration[6.0]
  def change
    IdeasPhase.find_by_sql("SELECT idea_id, phase_id FROM ideas_phases GROUP BY idea_id, phase_id HAVING COUNT(*) > 1").each do |ideas_phase|
      IdeasPhase.where(idea_id: ideas_phase.idea_id, phase_id: ideas_phase.phase_id).all.drop(1).each(&:destroy!)
    end

    add_index :ideas_phases, [:idea_id, :phase_id], unique: true
  end
end
