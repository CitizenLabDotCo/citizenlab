# frozen_string_literal: true

module Export
  # Sweeps expired +Export::ResultFile+ records (transient background-export
  # results, e.g. the input responses PDF) so they don't accumulate. Destroy
  # (rather than delete) so CarrierWave also removes the stored files.
  # Enqueued hourly per tenant (see hourly_jobs.rake).
  class CleanupExpiredResultsJob < ApplicationJob
    self.priority = 90 # pretty low priority (lowest is 100)

    def run
      Export::ResultFile.expired.find_each(&:destroy!)
    end
  end
end
