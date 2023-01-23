# frozen_string_literal: true

module MultiTenancy
  module Patches
    module EmailCampaigns
      module TasksService
        def schedule_email_campaigns
          Tenant.switch_each { super }
        end

        def assure_campaign_records
          Tenant.switch_each { super }
        end

        def remove_deprecated
          Tenant.switch_each { super }
        end

        def remove_consents(emails_url)
          Tenant.switch_each { super }
        end

        def ensure_unsubscription_tokens
          Tenant.switch_each { super }
        end

        def update_user_digest_schedules
          Tenant.switch_each do |tenant|
            Rails.logger.info("Could not update user digest schedule for #{tenant.host}") unless super
          end
        end
      end
    end
  end
end
