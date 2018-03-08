class AddSurveyIdAndSurveyServiceToParticipationContext < ActiveRecord::Migration[5.1]
  def change
  	add_column :phases, :survey_embed_url, :string, default: nil, null: true
  	add_column :phases, :survey_service, :string, default: nil, null: true
  	add_column :projects, :survey_embed_url, :string, default: nil, null: true
  	add_column :projects, :survey_service, :string, default: nil, null: true
  end
end
