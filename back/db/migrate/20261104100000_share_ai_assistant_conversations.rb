# frozen_string_literal: true

# Lets a feature other than the assistant keep its chat in these tables: the report
# builder stores one conversation per report, shared by everyone who edits it.
class ShareAIAssistantConversations < ActiveRecord::Migration[7.2]
  def change
    # No owner means a conversation shared by everyone with access to its subject.
    change_column_null :ai_assistant_conversations, :user_id, true
    reversible do |dir|
      # Going back means every conversation has an owner again, which a shared one
      # has not, so it goes — with its messages, tool calls and runs.
      dir.down { safety_assured { execute 'DELETE FROM ai_assistant_conversations WHERE user_id IS NULL' } }
    end

    # A shared conversation is the one chat about its subject, so a second one would
    # split its history in two.
    add_index :ai_assistant_conversations, %i[subject_type subject_id surface_key],
      unique: true, where: 'user_id IS NULL', name: 'index_ai_assistant_conversations_shared_on_subject'

    # A message in the words each of its readers needs: `content` is the text the chat
    # shows, `model_text` what the model is sent in its place — the prompt an app
    # writes around what a person typed, or a step of a long run the chat has nothing
    # to show for. They are one message and always read together, so they are one
    # column; `content` moves into it.
    add_column :ai_assistant_messages, :context, :jsonb, null: false, default: {}
    reversible do |dir|
      dir.up do
        safety_assured do
          execute <<~SQL.squish
            UPDATE ai_assistant_messages
            SET context = jsonb_build_object('content', content)
            WHERE content IS NOT NULL
          SQL
        end
      end
      dir.down do
        safety_assured { execute "UPDATE ai_assistant_messages SET content = context->>'content'" }
      end
    end
    safety_assured { remove_column :ai_assistant_messages, :content, :text }

    # Who wrote it. A shared conversation has no owner, so this is the only record of
    # who said what, and nothing can fill it in after the fact. Nullified rather than
    # cascaded, because the history outlives an account; indexed because that nullify
    # runs on every user deletion.
    safety_assured do
      add_reference :ai_assistant_messages, :author, type: :uuid, null: true,
        foreign_key: { to_table: :users, on_delete: :nullify }
    end
  end
end
