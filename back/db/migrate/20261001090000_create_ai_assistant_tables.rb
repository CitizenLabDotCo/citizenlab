# frozen_string_literal: true

# Conversations of the in-app AI assistant. The model only proposes changes: write tool
# calls are stored as proposals that the user approves or rejects before they run.
class CreateAIAssistantTables < ActiveRecord::Migration[7.2]
  def change
    create_table :ai_assistant_conversations, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: { on_delete: :cascade }
      # The record the conversation is about (e.g. the phase of a survey), looked up together
      # with the context key when the panel opens.
      t.references :context, type: :uuid, null: false, polymorphic: true
      t.string :context_key, null: false
      t.string :locale, null: false
      t.string :status, null: false, default: 'idle'
      t.string :last_error_code

      t.timestamps
    end

    create_table :ai_assistant_messages, id: :uuid do |t|
      t.references(
        :conversation,
        type: :uuid,
        null: false,
        index: false,
        foreign_key: { to_table: :ai_assistant_conversations, on_delete: :cascade }
      )
      t.integer :position, null: false
      t.string :role, null: false
      t.text :content
      t.uuid :file_ids, array: true, null: false, default: []
      t.integer :input_tokens
      t.integer :output_tokens

      t.timestamps
    end
    # Orders the messages (UUIDs don't sort by creation) and serves the foreign key.
    add_index :ai_assistant_messages, %i[conversation_id position], unique: true

    create_table :ai_assistant_tool_calls, id: :uuid do |t|
      t.references(
        :message,
        type: :uuid,
        null: false,
        foreign_key: { to_table: :ai_assistant_messages, on_delete: :cascade }
      )
      t.string :tool_use_id, null: false
      t.string :name, null: false
      t.jsonb :arguments, null: false, default: {}
      t.jsonb :bound_arguments, null: false, default: {}
      t.string :status, null: false
      t.text :result
      t.references :decided_by, type: :uuid, foreign_key: { to_table: :users, on_delete: :nullify }
      t.datetime :decided_at
      t.text :reason

      t.timestamps
    end
  end
end
