# frozen_string_literal: true

class AddAIProcessingAllowedToFiles < ActiveRecord::Migration[7.1]
  def change
    add_column(
      :files,
      :ai_processing_allowed,
      :boolean, default: false, null: false,
      comment: 'whether consent was given to process the file with AI'
    )
  end
end
