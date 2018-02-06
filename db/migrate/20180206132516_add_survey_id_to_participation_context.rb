class AddSurveyIdToParticipationContext < ActiveRecord::Migration[5.1]
  def change
  	add_column :phases, :survey_id, :string, default: nil, null: true
  	add_column :projects, :survey_id, :string, default: nil, null: true
  end
end
