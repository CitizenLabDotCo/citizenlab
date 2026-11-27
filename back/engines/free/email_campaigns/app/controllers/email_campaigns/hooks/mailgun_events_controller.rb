# frozen_string_literal: true

require 'openssl'

module EmailCampaigns
  class Hooks::MailgunEventsController < EmailCampaignsController
    skip_before_action :authenticate_user
    skip_after_action :verify_policy_scoped
    skip_after_action :verify_authorized

    before_action :verify, only: :create
    around_action :switch_tenant

    MAILGUN_STATUS_MAPPING = {
      'accepted' => 'accepted',
      'rejected' => 'bounced',
      'delivered' => 'delivered',
      'failed' => 'failed',
      'opened' => 'opened',
      'clicked' => 'clicked'
    }.freeze

    def create
      # Before the delivery lookup: emails that aren't tracked as deliveries can bounce too.
      EmailBounceService.new.handle_mailgun_event(params[:'event-data'])

      campaigns_recipient = Delivery.find_by(
        id: params[:'event-data'][:'user-variables'][:cl_delivery_id]
      )
      if campaigns_recipient
        target_status = MAILGUN_STATUS_MAPPING[params[:'event-data'][:event]]
        if target_status
          campaigns_recipient.set_delivery_status(target_status)
          if campaigns_recipient.save
            head :ok
          else
            head :internal_server_error
          end
        else
          # we're not supporting this event
          head :not_acceptable
        end
      else
        # We haven't sent out this mail
        head :not_acceptable
      end
    end

    private

    # from https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
    def verify
      # If the key is missing, there is nothing to verify against, so hooks are rejected.
      api_key = ENV.fetch('MAILGUN_API_KEY', nil)
      return head :unauthorized if api_key.blank?

      signature = params[:signature]
      return head :not_acceptable if signature.blank?

      data = [signature[:timestamp], signature[:token]].join
      expected = OpenSSL::HMAC.hexdigest('SHA256', api_key, data)
      head :not_acceptable unless ActiveSupport::SecurityUtils.secure_compare(signature[:signature].to_s, expected)
    end

    def switch_tenant(&)
      tenant_id = params.dig(:'event-data', :'user-variables', :cl_tenant_id)
      if tenant_id
        Tenant.find(tenant_id).switch(&)
      else
        head :not_acceptable
      end
    rescue Apartment::TenantNotFound, ActiveRecord::RecordNotFound
      head :not_acceptable
    end
  end
end
