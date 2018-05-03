class AddPresentationModeToPhases < ActiveRecord::Migration[5.1]
  def change
  	add_column :phases, :presentation_mode, :string, default: 'card', null: false
  end
end
