class AddDownvotingMethodAndLimitedMaxInParticipationContext < ActiveRecord::Migration[6.1]
  def change
    %i(projects phases).each do |tablename|
      rename_column tablename, :voting_method, :upvoting_method
      rename_column tablename, :voting_limited_max, :upvoting_limited_max
      add_column tablename, :downvoting_method, :string, null: false, default: 'unlimited'
      add_column tablename, :downvoting_limited_max, :integer, default: 10
    end
  end
end
