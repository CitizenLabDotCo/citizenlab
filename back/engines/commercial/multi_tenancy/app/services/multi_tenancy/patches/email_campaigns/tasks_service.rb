# frozen_string_literal: true

module MultiTenancy
  module Patches
    module EmailCampaigns
      module TasksService
        def schedule_email_campaigns
          Tenant.safe_switch_each { super }
        end

        def assure_campaign_records
          Tenant.safe_switch_each { super }
        end

        def remove_deprecated
          Tenant.safe_switch_each { super }
        end

        def remove_consents(emails_url)
          Tenant.safe_switch_each { super }
        end

        def ensure_unsubscription_tokens
          Tenant.safe_switch_each { super }
        end

        def update_user_digest_schedules
          Tenant.safe_switch_each do |tenant|
            Rails.logger.info("Could not update user digest schedule for #{tenant.host}") unless super
          end
        end
      end
    end
  end
end
