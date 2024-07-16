# frozen_string_literal: true

class AddAIReasonToInappropriateContentFlags < ActiveRecord::Migration[7.0]
  def change
    add_column :flag_inappropriate_content_inappropriate_content_flags, :ai_reason, :string, null: true
  end
end
