class AddConsultationMethodToPhases < ActiveRecord::Migration[5.1]
  def change
  	add_column :phases, :consultation_method, :string, null: false

  	Phase.all.each do |phase|
      phase.consultation_method = 'ideation'
      idea.save
    end
  end
end
