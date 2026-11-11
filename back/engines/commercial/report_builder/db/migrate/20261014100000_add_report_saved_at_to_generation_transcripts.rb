# frozen_string_literal: true

class AddReportSavedAtToGenerationTranscripts < ActiveRecord::Migration[7.2]
  def change
    # When this run's work was written to the report. A run can stop for a good
    # reason and still save nothing — the round cap is reached mid-edit, or the save
    # itself fails — and stopped_because cannot tell those apart, so the job records
    # the one fact that matters: this run is what the report holds.
    add_column :report_builder_generation_transcripts, :report_saved_at, :datetime
  end
end
