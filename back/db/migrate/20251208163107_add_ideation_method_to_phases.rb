# frozen_string_literal: true

class AddIdeationMethodToPhases < ActiveRecord::Migration[7.1]
  def change
    add_column :phases, :ideation_method, :string

    reversible do |dir|
      dir.up do
        safety_assured do
          # Convert idea_feed participation_method to ideation with ideation_method = 'idea_feed'
          execute "UPDATE phases SET ideation_method = 'idea_feed', participation_method = 'ideation' WHERE participation_method = 'idea_feed'"
          # Set base as default for existing ideation phases
          execute "UPDATE phases SET ideation_method = 'base' WHERE participation_method = 'ideation' AND ideation_method IS NULL"
        end
      end

      dir.down do
        safety_assured do
          # Convert back to idea_feed participation_method
          execute "UPDATE phases SET participation_method = 'idea_feed' WHERE participation_method = 'ideation' AND ideation_method = 'idea_feed'"
        end
      end
    end
  end
end
