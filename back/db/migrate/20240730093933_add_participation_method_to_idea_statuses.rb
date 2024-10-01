class AddParticipationMethodToIdeaStatuses < ActiveRecord::Migration[7.0]
  def change
    add_column :idea_statuses, :participation_method, :string, null: false, default: 'ideation'
  end
end
