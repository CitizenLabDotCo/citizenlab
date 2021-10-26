class AddDownvotingMethodAndLimitedMaxInParticipationContext < ActiveRecord::Migration[6.1]
  def change
    %i(projects phases).each do |tablename|
      rename_column tablename, :voting_method, :upvoting_method
      rename_column tablename, :voting_limited_max, :upvoting_limited_max

      add_column tablename, :downvoting_method, :string, null: false, default: 'unlimited'
      add_column tablename, :downvoting_limited_max, :integer, default: 10

      ActiveRecord::Base.connection.execute(
        "UPDATE #{tablename} SET voting_enabled = true WHERE voting_enabled IS NULL"
      )
      ActiveRecord::Base.connection.execute(
        "UPDATE #{tablename} SET upvoting_method = 'unlimited' WHERE upvoting_method IS NULL"
      )

      change_column_null tablename, :voting_enabled, false
      change_column_null tablename, :upvoting_method, false
    end
  end
end
