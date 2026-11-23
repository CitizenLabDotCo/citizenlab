# frozen_string_literal: true

module EmailCampaigns
  # Receives Scaleway Transactional Email events, pushed through Topics and Events (SNS)
  # to one cluster-wide URL. The tenant and the delivery are identified from the tracking
  # headers that `ApplicationMailer#campaign_mail` sets, which TEM echoes back in
  # `email_headers`.
  class Hooks::ScalewayEventsController < EmailCampaignsController
    skip_before_action :authenticate_user
    skip_after_action :verify_policy_scoped
    skip_after_action :verify_authorized

    # TEM event type => `Delivery::DELIVERY_STATUSES`
    # Event types not listed here leave the delivery untouched.
    STATUS_MAPPING = {
      'email_queued' => 'accepted',
      'email_delivered' => 'delivered',
      'email_dropped' => 'bounced', # permanent rejection of any kind
      'email_mailbox_not_found' => 'bounced', # permanent rejection because the address does not exist
      'email_spam' => 'failed' # classified as spam by TEM or the recipient
    }.freeze

    # `email_dropped` is TEM's catch-all for permanent rejections, including the recipient
    # server refusing the message for policy reasons; only a missing mailbox says the
    # address itself is bad.
    HARD_BOUNCE_TYPES = %w[email_mailbox_not_found].freeze

    # Anything that is not a valid envelope is refused with 401. Valid events we
    # have no use for (unknown delivery, unknown tenant, unhandled type) are still
    # acknowledged with 200, otherwise Topics and Events would retry them: the message
    # reached us correctly, we simply don't do anything with it.
    def create
      # `ScalewaySnsMessage` needs the exact bytes of the message (`raw_post`) to check the
      # signature.
      sns_message = ScalewaySnsMessage.parse!(request.raw_post)

      case sns_message.type
      when 'SubscriptionConfirmation' then confirm_subscription(sns_message)
      when 'Notification' then handle_event(sns_message.event)
      end

      head :ok
    rescue ScalewaySnsMessage::InvalidMessage => e
      ErrorReporter.report(e)
      head :unauthorized
    end

    private

    # One-time handshake after the subscription is created on the topic. A failed GET is
    # reported and still answered 200: the confirmation can be re-sent from the Scaleway
    # console.
    def confirm_subscription(sns_message)
      response = Faraday.get(sns_message.subscribe_url) do |request|
        # Bounded so a slow Scaleway endpoint cannot tie up a web worker.
        request.options.timeout = 5 # how long we wait for the response
        request.options.open_timeout = 5 # how long we wait to connect
      end

      logger.info(
        'Scaleway TEM webhook subscription confirmation',
        status: response.status, topic_arn: sns_message.topic_arn
      )
    rescue Faraday::Error => e
      ErrorReporter.report(e)
    end

    def handle_event(event)
      # `email_headers` is an array of `{ "key" => ..., "value" => ... }` pairs.
      headers = Array.wrap(event['email_headers']).to_h { |header| [header['key'].to_s.downcase, header['value']] }
      tenant_id = headers[ApplicationMailer::TENANT_ID_HEADER.downcase]
      return log_ignored(event, 'no tenant header') if tenant_id.blank?

      tenant = Tenant.find_by(id: tenant_id)
      return log_ignored(event, 'unknown tenant', tenant_id: tenant_id) unless tenant

      tenant.switch do
        record_bounce(event) if HARD_BOUNCE_TYPES.include?(event['type'])
        update_delivery(event, headers[ApplicationMailer::DELIVERY_ID_HEADER.downcase])
      end
    end

    def record_bounce(event)
      reason = [event['email_response_code'], event['email_response_message']].compact_blank.join(' ').presence
      EmailBounceService.new.record_bounce(event['email_to'], reason)
    end

    def update_delivery(event, delivery_id)
      status = STATUS_MAPPING[event['type']]
      return log_ignored(event, 'unhandled event type') unless status

      # e.g. admin previews are sent without a delivery record
      delivery = delivery_id.present? && Delivery.find_by(id: delivery_id)
      return log_ignored(event, 'unknown delivery', delivery_id: delivery_id) unless delivery

      delivery.set_delivery_status(status)
      delivery.save!
    end

    def log_ignored(event, reason, **details)
      logger.info(
        'Ignored Scaleway TEM event',
        reason: reason, event_type: event['type'], email_id: event['email_id'],
        **details
      )
    end
  end
end
