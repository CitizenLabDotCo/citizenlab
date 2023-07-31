# frozen_string_literal: true

class AddVotingMethodToParticipationContext < ActiveRecord::Migration[6.1]
  def change
    %i[projects phases].each do |tablename|
      add_column tablename, :voting_method, :string
      execute "UPDATE #{tablename} SET voting_method = 'budgeting' WHERE participation_method = 'budgeting'"
      execute "UPDATE #{tablename} SET participation_method = 'voting' WHERE participation_method = 'budgeting'"

      add_column tablename, :voting_max_votes_per_idea, :integer
      rename_column tablename, :max_budget, :voting_max_total
      rename_column tablename, :min_budget, :voting_min_total
      add_column tablename, :voting_term_singular_multiloc, :jsonb, default: {}
      add_column tablename, :voting_term_plural_multiloc, :jsonb, default: {}
    end
  end
end
