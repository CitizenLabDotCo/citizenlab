# frozen_string_literal: true

# This migration comes from content_builder (originally 20261104100200)
class RenameGenerationTranscriptIdOnCustomBlockVersions < ActiveRecord::Migration[7.2]
  def change
    # The run that wrote the version. Runs replaced generation transcripts, and a
    # run belongs to the assistant's tables rather than the report builder's.
    safety_assured do
      rename_column :content_builder_custom_block_versions, :generation_transcript_id, :run_id
    end
  end
end
