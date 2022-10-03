# frozen_string_literal: true

module Analytics
  class ImportLatestMatomoDataJob < ::ApplicationJob
    perform_retries false

    # Not too many import tasks should be performed at the same time to avoid putting
    # too much pressure on Matomo. For this reason, we implemented a *simplistic
    # mechanism* relying on Postgres advisory locks to limit the number of concurrent
    # jobs (Que does have that feature). However, Postgres advisory locks are binary
    # locks, so in order to allow more than one job to run at the same time, we use
    # multiple locks (`MAX_CONCURRENCY`). Each job is pseudo-randomly assigned to one of
    # these locks (based on the hash of its target site id). If it fails to acquire this
    # lock, the job is rescheduled (even if some other locks are available).
    MAX_CONCURRENCY = 10

    # We resume the import of data from a little further back in time (wrt the end of
    # the previous import) to make sure to capture most of the visits that were slow to
    # reach Matomo. The current duration is an arbitrary choice and has not been
    # determined by any smart calculations.
    RETROACTIVE_IMPORT = 15.minutes

    def run(tenant_id, min_duration: 1.day, max_nb_batches: 5, batch_size: 250)
      Tenant.find(tenant_id).switch do
        matomo_site_id = AppConfiguration.instance.settings.dig('matomo', 'tenant_site_id')
        lock_name = calculate_lock_name(matomo_site_id)

        # Failures to lock are handled by #handle_error.
        CitizenLab::LockManager.try_with_transaction_lock(lock_name) do
          import_data(matomo_site_id, min_duration, max_nb_batches, batch_size)
        end
      end
    end

    def self.perform_for_all_tenants(min_duration: 1.day, max_nb_batches: 5, batch_size: 250)
      kwargs = { min_duration: min_duration, max_nb_batches: max_nb_batches, batch_size: batch_size }
      Tenant.ids.map { |tenant_id| perform_later(tenant_id, **kwargs) }
    end

    private

    def handle_error(error)
      case error
      when CitizenLab::LockManager::FailedToLock then reschedule_in rand(10..20).minutes
      else super
      end
    end

    def reschedule_in(duration)
      Rails.logger.info(
        'rescheduling Analytics::ImportLatestMatomoDataJob',
        tenant_id: AppConfiguration.instance.id, job_id: id, executions: executions
      )
      retry_in(duration)
    end

    def import_data(site_id, min_duration, max_nb_batches, batch_size)
      # We resume the import at the timestamp of the last action or at the time of
      # creation of the platform if there are no visits yet in the DB.
      from_timestamp =
        (FactVisit.maximum(:matomo_last_action_time) || AppConfiguration.instance.created_at).to_i

      from_timestamp -= RETROACTIVE_IMPORT.to_i
      MatomoDataImporter.new.import(
        site_id, from_timestamp,
        min_duration: min_duration, max_nb_batches: max_nb_batches, batch_size: batch_size
      )
    end

    def calculate_lock_name(site_id)
      "#{Analytics::ImportLatestMatomoDataJob}(#{site_id.hash % MAX_CONCURRENCY})"
    end
  end
end
