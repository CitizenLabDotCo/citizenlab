# frozen_string_literal: true

# This migration comes from analysis (originally 20230825140805)
class AddBackgroundTaskIdToTaggings < ActiveRecord::Migration[7.0]
  def change
    # No index or foreign key for now, as this is currently not used, just there
    # to have the data on how a tagging was created, for analytics or future use
    add_reference :analysis_taggings, :background_task, type: :uuid, index: false
  end
end
