# frozen_string_literal: true

module MultiTenancy
  module Tenants
    # This job waits for all user accounts to be deleted before deleting the
    # tenant. Indeed, users need to be deleted beforehand to make sure PII
    # is removed from third-party services.
    #
    # The job reschedules itself at a later time if there are some users left,
    # otherwise the tenant is deleted. If the number of users didn't decrease
    # between two consecutive attempts, the deletion is aborted.
    class DeleteJob < ApplicationJob
      perform_retries(false)

      # @param [Tenant] tenant
      # @param [Integer,NilClass] last_user_count
      # @param [ActiveSupport::Duration] wait delay between two delete attempts
      def run(tenant, last_user_count: nil, wait: 1.hour)
        user_count = tenant.switch { User.count }

        if user_count.zero?
          tenant.destroy!
          MultiTenancy::SideFxTenantService.new.after_destroy(tenant)

        elsif last_user_count.nil? || user_count < last_user_count
          DeleteJob.set(wait: wait).perform_later(tenant, last_user_count: user_count, wait: wait)

        else # the user count is not decreasing
          raise Aborted, tenant.id
        end
      end

      class Aborted < RuntimeError; end
    end
  end
end


