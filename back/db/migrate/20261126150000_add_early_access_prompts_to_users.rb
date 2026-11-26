# frozen_string_literal: true

class AddEarlyAccessPromptsToUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :early_access_prompts, :jsonb, default: {}, null: false
  end
end
