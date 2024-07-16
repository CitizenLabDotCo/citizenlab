# frozen_string_literal: true

# This migration comes from polls (originally 20231123160812)
class PollsRenameParticipationContext < ActiveRecord::Migration[6.1]
  def change
    rename_column :polls_questions, :participation_context_id, :phase_id
    remove_column :polls_questions, :participation_context_type, :string
    rename_column :polls_responses, :participation_context_id, :phase_id
    remove_column :polls_responses, :participation_context_type, :string
  end
end
