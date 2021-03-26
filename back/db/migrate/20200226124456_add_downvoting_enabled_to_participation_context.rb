class AddDownvotingEnabledToParticipationContext < ActiveRecord::Migration[6.0]
  def change
    add_column :projects, :downvoting_enabled, :boolean, null: false, default: true
    add_column :phases,   :downvoting_enabled, :boolean, null: false, default: true
  end
end
