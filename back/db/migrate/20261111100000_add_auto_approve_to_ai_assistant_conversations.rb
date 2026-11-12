# frozen_string_literal: true

class AddAutoApproveToAIAssistantConversations < ActiveRecord::Migration[7.1]
  def change
    add_column :ai_assistant_conversations, :auto_approve, :boolean, null: false, default: false
  end
end
