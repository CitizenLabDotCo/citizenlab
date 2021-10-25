class AddDownvotingMethodAndLimitedMaxInParticipationContext < ActiveRecord::Migration[6.1]
  def change
    Project.where(voting_enabled: nil).update_all(voting_enabled: true)
    Project.where(upvoting_method: nil).update_all(upvoting_method: 'unlimited')
    Phase.where(voting_enabled: nil).update_all(voting_enabled: true)
    Phase.where(upvoting_method: nil).update_all(upvoting_method: 'unlimited')

    %i(projects phases).each do |tablename|
      rename_column tablename, :voting_method, :upvoting_method
      rename_column tablename, :voting_limited_max, :upvoting_limited_max

      add_column tablename, :downvoting_method, :string, null: false, default: 'unlimited'
      add_column tablename, :downvoting_limited_max, :integer, default: 10

      change_column_null tablename, :voting_enabled, false
      change_column_null tablename, :upvoting_method, false
    end
  end
end
