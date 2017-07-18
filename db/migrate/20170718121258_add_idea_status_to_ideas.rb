class AddIdeaStatusToIdeas < ActiveRecord::Migration[5.1]
  def change
    add_reference :ideas, :idea_status, foreign_key: true, type: :uuid
  end
end
