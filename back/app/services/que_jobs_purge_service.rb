# frozen_string_literal: true

# Deletes queued Que jobs that reference a record being destroyed, so they never run
# against a record that no longer exists (e.g. a "phase started" email queued with an
# 8-hour delay for a phase that is deleted before delivery).
#
# Only jobs that can still run are deleted (see QueJob.runnable). A job already picked up
# by a worker is not stopped by this — delivery-time guards cover that race (see
# EmailCampaigns::ApplicationMailer#context_deleted?).
class QueJobsPurgeService
  # Job classes for which "references a destroyed record" implies the job must not run.
  # Deliberately an allowlist: some jobs reference records only incidentally, and jobs
  # designed to run after a record's deletion take raw ids rather than GlobalIDs.
  PURGEABLE_JOB_CLASSES = %w[
    ActionMailer::MailDeliveryJob
    ProcessScheduledPublicationTransitionsJob
  ].freeze

  def purge_related_to(record)
    QueJob.runnable
      .all_related_to_gid(record.to_global_id.to_s)
      .where("args #>> '{0,job_class}' IN (?)", PURGEABLE_JOB_CLASSES)
      .delete_all
  end
end
