class AddInputTermsToParticipationModels < ActiveRecord::Migration[6.0]
  def change
    add_column :phases, :input_term, :string, default: 'idea'
    add_column :projects, :input_term, :string, default: 'idea'
  end
end
