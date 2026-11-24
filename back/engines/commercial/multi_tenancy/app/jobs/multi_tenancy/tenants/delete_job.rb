# frozen_string_literal: true

module MultiTenancy
  module Tenants
    # Deletes a tenant that +TenantService#delete+ marked as deleted.
    #
    # Dropping the tenant's schema deletes all its data at once, users included. The users are
    # not deleted one by one first (no +DeleteUserJob+), because that is expensive for the
    # database: on 2026-10-27, five large tenants deleted within 11 minutes queued tens of
    # thousands of user deletions, and the Benelux database ran out of memory.
    #
    # Only what dropping the schema doesn't cover is done separately:
    # - The users are removed from third-party services (Intercom, Segment, Matomo, PostHog),
    #   with one job per service per +THIRD_PARTY_REMOVAL_BATCH_SIZE+ users.
    # - Their avatars are deleted from S3.
    #
    # The first run queues the third-party removals and reschedules itself. The next runs wait
    # until those jobs are done, because destroying the tenant deletes the jobs of its schema
    # that are still queued. Then the avatars are deleted and the tenant is destroyed.
    class DeleteJob < ApplicationJob
      perform_retries(false)

      THIRD_PARTY_REMOVAL_BATCH_SIZE = 250
      # How long to wait before checking again whether the third-party removals are done.
      CHECK_INTERVAL = 2.minutes
      # Queued by +SideFxUserService#after_destroy_all+.
      THIRD_PARTY_REMOVAL_JOBS = %w[
        RemoveUserFromIntercomJob
        RemoveUsersFromSegmentJob
        Matomo::RemoveUserFromMatomoJob
        PosthogIntegration::RemoveUserFromPosthogJob
      ].freeze

      # @param [Tenant] tenant
      # @param [Boolean] third_party_removal_queued
      # @param [Hash] _legacy_options +last_user_count+ and +retry_interval+, passed by jobs that
      #   were queued when users were still deleted one by one. Ignored.
      def run(tenant, third_party_removal_queued: false, **_legacy_options)
        unless third_party_removal_queued
          queue_third_party_removal(tenant)
          return reschedule(tenant)
        end

        return reschedule(tenant) if third_party_removal_pending?(tenant)

        delete_avatars(tenant)
        tenant.destroy!
        MultiTenancy::SideFxTenantService.new.after_destroy(tenant)
      end

      private

      def queue_third_party_removal(tenant)
        tenant.switch do
          side_fx = SideFxUserService.new
          User.pluck(:id).each_slice(THIRD_PARTY_REMOVAL_BATCH_SIZE) { |user_ids| side_fx.after_destroy_all(user_ids) }
        end
      end

      # Called outside of +tenant.switch+ on purpose: destroying the tenant deletes all the
      # jobs of its schema (+Tenant#delete_que_jobs+), and this job must not be one of them.
      def reschedule(tenant)
        DeleteJob.set(wait: CHECK_INTERVAL).perform_later(tenant, third_party_removal_queued: true)
      end

      def third_party_removal_pending?(tenant)
        THIRD_PARTY_REMOVAL_JOBS.any? do |job_class|
          QueJob
            .by_job_class(job_class)
            .all_by_tenant_schema_name(tenant.schema_name)
            .not_finished
            .not_expired
            .exists?
        end
      end

      # Deleting a user deletes its avatar, but dropping the schema doesn't. All avatars of the
      # tenant are stored under one prefix (see +MultiTenancy::Patches::BaseUploader#store_dir+).
      #
      # The tenant's other files are not deleted (yet).
      def delete_avatars(tenant)
        return unless AvatarUploader.use_fog_engine?

        result = Aws::S3::Utils.new.delete_objects(
          ENV.fetch('AWS_S3_BUCKET'),
          Aws::S3::Client.new,
          prefix: "uploads/#{tenant.id}/user/avatar/"
        )
        return if result[:errors_count].zero?

        ErrorReporter.report_msg(
          'Some avatars of a deleted tenant could not be deleted from S3',
          extra: { tenant_id: tenant.id, **result }
        )
      end
    end
  end
end
