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
      return unless ENV.fetch('MAILGUN_API_KEY', false)

      api_key = ENV.fetch('MAILGUN_API_KEY')
      token = params[:signature][:token]
      timestamp = params[:signature][:timestamp]
      signature = params[:signature][:signature]

      digest = OpenSSL::Digest.new('SHA256')
      data = [timestamp, token].join

      head :not_acceptable if signature != OpenSSL::HMAC.hexdigest(digest, api_key, data)
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
