# frozen_string_literal: true

module MultiTenancy
  module Tenants
    # Deletes a tenant that +TenantService#delete+ marked as deleted.
    #
    # Destroying the tenant drops its schema, which deletes all its data, users included, so
    # users aren't deleted one by one (that is very heavy on the database). Only the user data
    # outside the schema is removed separately: from third-party services, and avatars on S3.
    class DeleteJob < ApplicationJob
      perform_retries(false)

      THIRD_PARTY_REMOVAL_BATCH_SIZE = 250
      CHECK_INTERVAL = 2.minutes
      # The jobs queued by +SideFxUserService#after_destroy_all+.
      THIRD_PARTY_REMOVAL_JOBS = %w[
        RemoveUserFromIntercomJob
        RemoveUsersFromSegmentJob
        Matomo::RemoveUserFromMatomoJob
        PosthogIntegration::RemoveUserFromPosthogJob
      ].freeze

      # @param [Tenant] tenant
      # @param [Boolean] third_party_removal_queued
      # @param [Hash] _legacy_options ignored. Accepts the arguments of jobs queued by the
      #   previous version of this job (+last_user_count+, +retry_interval+).
      def run(tenant, third_party_removal_queued: false, **_legacy_options)
        unless third_party_removal_queued
          queue_third_party_removal(tenant)
          return reschedule(tenant)
        end

        # Destroying the tenant deletes its queued jobs, so the removals must be done first.
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

      # Queues this job again, to check in +CHECK_INTERVAL+ whether the third-party removals are
      # done. Don't call it inside +tenant.switch+: the job would then belong to the tenant's
      # schema, and destroying the tenant deletes every job of that schema
      # (+Tenant#delete_que_jobs+), including the run that is destroying it.
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

      # Dropping the schema doesn't delete files. The tenant's other files are kept for now.
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
