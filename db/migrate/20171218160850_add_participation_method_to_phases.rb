class AddParticipationMethodToPhases < ActiveRecord::Migration[5.1]
  def change
  	add_column :phases, :participation_method, :string, null: false

  	Phase.all.each do |phase|
      phase.participation_method = 'ideation'
      idea.save
    end
  end
end
