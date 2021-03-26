class CreateInitiativeInitiativeStatuses < ActiveRecord::Migration[5.2]
  def change
    create_view :initiative_initiative_statuses
  end
end
