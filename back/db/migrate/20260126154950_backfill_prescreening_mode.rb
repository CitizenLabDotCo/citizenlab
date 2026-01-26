# frozen_string_literal: true

class BackfillPrescreeningMode < ActiveRecord::Migration[7.2]
  def change
    reversible do |dir|
      dir.up do
        safety_assured do
          # It could be done in a single query, but it's more readable this way.
          execute <<-SQL.squish
            UPDATE phases SET prescreening_mode = 'all'
            WHERE prescreening_enabled AND prescreening_mode IS NULL
          SQL
          execute <<-SQL.squish
            UPDATE phases SET prescreening_mode = NULL
            WHERE NOT prescreening_enabled AND prescreening_mode IS NOT NULL
          SQL
        end
      end
    end
  end
end
