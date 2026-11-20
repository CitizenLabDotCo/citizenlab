# frozen_string_literal: true

module MultiTenancy
  module Tenants
    # This job waits for all user accounts to be deleted before deleting the
    # tenant. Indeed, users need to be deleted beforehand to make sure PII
    # is removed from third-party services.
    #
    # The job reschedules itself at a later time if there are some users left,
    # or if their data is still being removed from Matomo. Otherwise the tenant
    # is deleted. If the number of users didn't decrease between two consecutive
    # attempts, the deletion is aborted.
    class DeleteJob < ApplicationJob
      perform_retries(false)

      # @param [Tenant] tenant
      # @param [Integer,NilClass] last_user_count
      # @param [ActiveSupport::Duration] retry_interval delay between two delete attempts
      def run(tenant, last_user_count: nil, retry_interval: 6.hours)
        user_count = tenant.switch { User.count }

        if user_count.zero? && matomo_removal_pending?(tenant)
          reschedule(tenant, user_count, retry_interval, 'user data is still being removed from Matomo')

        elsif user_count.zero?
          tenant.destroy!
          MultiTenancy::SideFxTenantService.new.after_destroy(tenant)

        elsif last_user_count.nil? || user_count < last_user_count
          reschedule(tenant, user_count, retry_interval, 'not all users have been deleted yet')

        else
          raise Aborted, <<~MSG.squish
            Deletion of '#{tenant.id}' is aborted because the user count
            (#{user_count}) is not decreasing.
          MSG
        end
      end

      private

      def reschedule(tenant, user_count, retry_interval, reason)
        Rails.logger.info(<<~MSG.squish)
          Rescheduling Tenants::DeleteJob for tenant '#{tenant.id}'
          because #{reason}, trying again in #{retry_interval.inspect}.
        MSG

        DeleteJob.set(wait: retry_interval)
          .perform_later(tenant, last_user_count: user_count, retry_interval: retry_interval)
      end

      # Destroying the tenant deletes its queued jobs, so the Matomo jobs must be done first.
      # Expired jobs do not count: they will never run again.
      def matomo_removal_pending?(tenant)
        QueJob.by_job_class(Matomo::RemoveUserFromMatomoJob)
          .all_by_tenant_schema_name(tenant.schema_name)
          .not_finished.not_expired
          .exists?
      end

      class Aborted < RuntimeError; end
    end
  end
end
