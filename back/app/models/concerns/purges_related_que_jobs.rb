# frozen_string_literal: true

# Deletes queued Que jobs referencing this record when it is destroyed, so that e.g. a
# delayed "phase started" email is cancelled when its phase is deleted before delivery.
#
# A model callback (not a SideFx service) because `dependent: :destroy` cascades bypass
# SideFx entirely — deleting a project must also purge jobs of its phases. `after_destroy`
# (not `before_destroy`/`after_commit`) because que_jobs lives in the same database, so
# the purge commits or rolls back atomically with the record's deletion.
#
# Only include in low-cardinality models (phases, projects, ...): the purge issues one
# query per destroyed record, so a model destroyed tens of thousands at a time in a
# cascade would need batching instead.
module PurgesRelatedQueJobs
  extend ActiveSupport::Concern

  included do
    after_destroy :purge_related_que_jobs
  end

  private

  def purge_related_que_jobs
    QueJobsPurgeService.new.purge_related_to(self)
  end
end
