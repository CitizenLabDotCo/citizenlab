class AddFormIdToParticipationContext < ActiveRecord::Migration[5.1]
  def change
  	add_column :phases, :form_id, :string, default: nil, null: true
  	add_column :projects, :form_id, :string, default: nil, null: true
  end
end
