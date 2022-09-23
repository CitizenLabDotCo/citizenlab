# frozen_string_literal: true

module Analytics
  class ImportLatestMatomoDataJob < ::ApplicationJob
    perform_retries false

    # Not too many import tasks should be performed at the same time to avoid putting
    # too much pressure on Matomo. We implemented a *simplistic mechanism* relying on
    # Postgres advisory locks to limit the number of concurrent jobs. However,
    # Postgres advisory locks are binary locks, so in order to allow more than one job
    # to run more at the same, we use multiple (`MAX_CONCURRENCY`) locks. Each job is
    # assigned to one of those locks based on the hash of its target site id. If it
    # fails to acquire this lock, the job is rescheduled (even if some other locks are
    # available).
    MAX_CONCURRENCY = 10

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
      Tenant.ids.map { perform_later(tenant_id, **kwargs) }
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
        FactVisit.maximum(:last_action_timestamp) || AppConfiguration.instance.created_at.to_i

      # We go back 15min in time to import the visits that were maybe a bit slow to
      # reach Matomo. 15 minutes is an arbitrary choice and is not backed up by any smart
      # calculations.
      from_timestamp -= 900 # 15min = 60 * 15 = 900
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
