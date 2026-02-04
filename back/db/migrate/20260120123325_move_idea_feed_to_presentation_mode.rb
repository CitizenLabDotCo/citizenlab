# frozen_string_literal: true

class MoveIdeaFeedToPresentationMode < ActiveRecord::Migration[7.1]
  def change
    reversible do |dir|
      dir.up do
        safety_assured do
          execute "UPDATE phases SET presentation_mode = 'feed' WHERE ideation_method = 'idea_feed'"
        end
      end

      dir.down do
        safety_assured do
          execute "UPDATE phases SET ideation_method = 'idea_feed' WHERE presentation_mode = 'feed'"
        end
      end
    end
  end
end
