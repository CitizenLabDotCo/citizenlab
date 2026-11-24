# frozen_string_literal: true

module MultiTenancy
  module Tenants
    # Deletes a tenant that +TenantService#delete+ marked as deleted.
    #
    # Users must be deleted one by one before the tenant itself, so that their PII is also
    # removed from third-party services. This job drives that: each run queues the next
    # batch of +DeleteUserJob+s, then reschedules itself. Once no users are left, the tenant
    # is destroyed.
    #
    # Deleting users is expensive for the database (cascading deletes, follow-up jobs), so it
    # is throttled in two ways (see the 2026-10-27 Benelux database crash, where five large
    # tenants deleted within 11 minutes queued tens of thousands of jobs at once and the
    # database ran out of memory):
    # - Only one tenant per cluster is deleted at a time: the one whose deletion was requested
    #   first. The others wait for their turn (see +#my_turn?+).
    # - Users are deleted in batches of +BATCH_SIZE+. The next batch is only queued once the
    #   previous one has been processed.
    #
    # Users are removed from third-party services in bulk, one job per service per batch
    # (see +User.destroy_all_async+). The tenant is only destroyed once those jobs are done,
    # because destroying it deletes the jobs of its schema that are still queued.
    #
    # If the user count did not decrease after a batch was processed, the deletion is
    # aborted. The tenant then no longer blocks the deletion of other tenants.
    class DeleteJob < ApplicationJob
      perform_retries(false)

      # +User.destroy_all_async+ spreads the jobs out at 5 per second, so one batch is
      # queued over about 50 seconds.
      BATCH_SIZE = 250
      # How long to wait before checking whether the current batch has been processed.
      BATCH_CHECK_INTERVAL = 2.minutes
      # How long to wait when another tenant is being deleted.
      TURN_CHECK_INTERVAL = 10.minutes
      # Queued by +User.destroy_all_async+ (see +SideFxUserService#after_destroy_all+).
      THIRD_PARTY_REMOVAL_JOBS = %w[
        RemoveUserFromIntercomJob
        RemoveUsersFromSegmentJob
        Matomo::RemoveUserFromMatomoJob
        PosthogIntegration::RemoveUserFromPosthogJob
      ].freeze

      # @param [Tenant] tenant
      # @param [Integer,NilClass] last_user_count the user count when the last batch was queued
      # @param [Object] retry_interval ignored. Only accepted so that the jobs queued before
      #   the batching was introduced can still run.
      def run(tenant, last_user_count: nil, retry_interval: nil)
        return reschedule(tenant, TURN_CHECK_INTERVAL, last_user_count:) unless my_turn?(tenant)

        user_count = tenant.switch { User.count }

        # Destroying the tenant deletes its queued jobs, so the third-party removals must
        # be done before the tenant is destroyed.
        pending_jobs = user_count.zero? ? THIRD_PARTY_REMOVAL_JOBS : [DeleteUserJob.name]
        return reschedule(tenant, BATCH_CHECK_INTERVAL, last_user_count:) if jobs_pending?(tenant, pending_jobs)

        if user_count.zero?
          tenant.destroy!
          MultiTenancy::SideFxTenantService.new.after_destroy(tenant)
        elsif last_user_count && user_count >= last_user_count
          raise Aborted, <<~MSG.squish
            Deletion of '#{tenant.id}' is aborted because the user count
            (#{user_count}) did not decrease after the last batch.
          MSG
        else
          tenant.switch { User.destroy_all_async(User.order(:created_at, :id).limit(BATCH_SIZE)) }
          reschedule(tenant, BATCH_CHECK_INTERVAL, last_user_count: user_count)
        end
      end

      private

      # Called outside of +tenant.switch+ on purpose: destroying the tenant deletes all the
      # jobs of its schema (+Tenant#delete_que_jobs+), and this job must not be one of them.
      def reschedule(tenant, wait, last_user_count:)
        DeleteJob.set(wait:).perform_later(tenant, last_user_count:)
      end

      # The turn goes to the tenant whose deletion was requested first, among the tenants
      # that are still waiting to be deleted. A tenant only counts as waiting if it has an
      # active +DeleteJob+: an aborted deletion expires its job, so it does not block the
      # others forever.
      def my_turn?(tenant)
        waiting_ids = tenant_ids_with_active_delete_job
        # Safety net: this job is itself active, so its tenant should always be in the list.
        waiting_ids << tenant.id

        first_in_line = Tenant.deleted.where(id: waiting_ids).order(:deleted_at, :id).first
        first_in_line.nil? || first_in_line.id == tenant.id
      end

      def tenant_ids_with_active_delete_job
        QueJob
          .by_job_class(self.class.name)
          .not_finished
          .not_expired
          .pluck(:args)
          .filter_map { |args| tenant_id_from_global_id(args.first&.dig('arguments', 0, '_aj_globalid')) }
      end

      def tenant_id_from_global_id(global_id)
        GlobalID.parse(global_id)&.model_id if global_id
      end

      def jobs_pending?(tenant, job_classes)
        job_classes.any? do |job_class|
          QueJob
            .by_job_class(job_class)
            .all_by_tenant_schema_name(tenant.schema_name)
            .not_finished
            .not_expired
            .exists?
        end
      end

      class Aborted < RuntimeError; end
    end
  end
end
