# frozen_string_literal: true

# Lets a feature other than the assistant keep its chat in these tables: the report
# builder stores one conversation per report, shared by everyone who edits it.
class ShareAIAssistantConversations < ActiveRecord::Migration[7.2]
  def change
    # No owner means a conversation shared by everyone with access to its subject.
    change_column_null :ai_assistant_conversations, :user_id, true
    # A shared conversation is the one chat about its subject, so a second one would
    # split its history in two.
    add_index :ai_assistant_conversations, %i[subject_type subject_id surface_key],
      unique: true, where: 'user_id IS NULL', name: 'index_ai_assistant_conversations_shared_on_subject'

    # A message can be for the chat panel only (what a person typed, a closing reply),
    # or for the model only (prompt scaffolding, the steps of a long run).
    add_column :ai_assistant_messages, :displayed, :boolean, null: false, default: true
    add_column :ai_assistant_messages, :replayed, :boolean, null: false, default: true
  end
end
