# frozen_string_literal: true

class AddAccessDeniedExplanationToPermission < ActiveRecord::Migration[7.0]
  def change
    add_column :permissions, :access_denied_explanation_multiloc, :jsonb, default: {}, null: false
  end
end
