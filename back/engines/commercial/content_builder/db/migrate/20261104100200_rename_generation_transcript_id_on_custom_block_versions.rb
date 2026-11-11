# frozen_string_literal: true

class RenameGenerationTranscriptIdOnCustomBlockVersions < ActiveRecord::Migration[7.2]
  def change
    # The report run that wrote the version. Runs replaced generation transcripts.
    safety_assured do
      rename_column :content_builder_custom_block_versions, :generation_transcript_id, :report_run_id
    end
  end
end
