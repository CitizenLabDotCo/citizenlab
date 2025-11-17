# frozen_string_literal: true

require 'http'

module Webhooks
  class DeliveryJob < ApplicationJob
    queue_as :default
    # Disable Que retries, we handle webhook retries through ActiveJob
    perform_retries false
    self.priority = 60

    class UnsuccessfulResponse < StandardError; end

    # Hardcoded constants
    MAX_RETRIES = 3
    CONNECT_TIMEOUT = 5  # seconds
    READ_TIMEOUT = 10    # seconds
    WRITE_TIMEOUT = 10   # seconds
    DISABLE_AFTER_FAILURES = 50

    # Exponential backoff: 1min, 5min, 30min
    retry_on StandardError,
      wait: :polynomially_longer,
      attempts: MAX_RETRIES do |job, exception|
      delivery = job.arguments.first

      delivery.update!(
        status: 'failed',
        error_message: "#{exception.class}: #{exception.message}",
        last_attempt_at: Time.current
      )

      # Consider disabling subscription after many consecutive failures
      check_subscription_health(delivery.subscription)
    end

    def perform(delivery)
      subscription = delivery.subscription

      return unless subscription.enabled?

      # Generate payload
      payload_json = Webhooks::PayloadService.new
        .generate(delivery.activity)
        .to_json

      # Generate HMAC signature
      signature = generate_signature(payload_json, subscription.secret_token)

      # Validate URL at delivery time (DNS rebinding protection)
      unless validate_url_safe(subscription.url)
        raise SecurityError, 'URL validation failed at delivery time'
      end

      # Deliver webhook with proper timeout and no redirects
      response = HTTP
        .timeout(
          connect: CONNECT_TIMEOUT,
          read: READ_TIMEOUT,
          write: WRITE_TIMEOUT
        )
        .headers(
          'Content-Type' => 'application/json',
          'X-GoVocal-Event' => delivery.event_type,
          'X-GoVocal-Signature' => signature,
          'X-GoVocal-Delivery-ID' => delivery.id,
          'User-Agent' => 'GoVocal-Webhooks/1.0'
        )
        .post(subscription.url, body: payload_json)

      if response.status.redirect?
        raise SecurityError, 'Redirects are not allowed'
      elsif response.status.success?
        delivery.update!(
          status: 'success',
          attempts: delivery.attempts + 1,
          response_code: response.code,
          response_body: response.body.to_s.truncate(10_000),
          last_attempt_at: Time.current,
          succeeded_at: Time.current
        )
      else
        delivery.update!(
          attempts: delivery.attempts + 1,
          error_message: "HTTP Error: #{response.code}",
          response_code: response.code,
          response_body: response.body.to_s.truncate(10_000),
          last_attempt_at: Time.current
        )
        # Raise so we can retry
        raise UnsuccessfulResponse, "HTTP Error: #{response.code}"
      end
    rescue HTTP::Error => e
      # Record attempt, will retry via ActiveJob
      delivery.update!(
        attempts: delivery.attempts + 1,
        error_message: "#{e.class}: #{e.message}",
        last_attempt_at: Time.current
      )
      raise # Re-raise to trigger retry
    rescue SecurityError => e
      # Don't retry security errors
      delivery.update!(
        status: 'failed',
        attempts: delivery.attempts + 1,
        error_message: "Security error: #{e.message}",
        last_attempt_at: Time.current
      )
      # Don't re-raise - permanent failure
    end

    private

    def generate_signature(payload, secret)
      hmac = OpenSSL::HMAC.digest(OpenSSL::Digest.new('sha256'), secret, payload)
      "sha256=#{Base64.strict_encode64(hmac)}"
    end

    def validate_url_safe(url)
      # Same validation logic as WebhookUrlValidator
      uri = URI.parse(url)

      # Validate scheme
      return false unless valid_scheme?(uri.scheme)

      # Validate hostname
      return false if uri.host.blank?

      # Resolve DNS and check against blocklist
      addresses = Resolv.getaddresses(uri.host)
      return false if addresses.empty?

      addresses.each do |addr_string|
        ip = IPAddr.new(addr_string)

        # Allow localhost in development only
        if private_ip?(ip) && !allow_localhost?(uri.host)
          return false
        end
      end

      true
    rescue URI::InvalidURIError, Resolv::ResolvError, ArgumentError
      false
    end

    def valid_scheme?(scheme)
      return false if scheme.blank?

      if Rails.env.development?
        %w[http https].include?(scheme.downcase)
      else
        scheme.downcase == 'https'
      end
    end

    def private_ip?(ip)
      WebhookUrlValidator::BLOCKED_IP_RANGES.any? { |range| range.include?(ip) }
    end

    def allow_localhost?(host)
      Rails.env.development? && ['localhost', '127.0.0.1', '::1'].include?(host)
    end

    def self.check_subscription_health(subscription)
      # Check if last N deliveries all failed
      recent_failures = subscription.deliveries
        .recent
        .limit(DISABLE_AFTER_FAILURES)
        .count { |d| d.status == 'failed' }

      if recent_failures >= DISABLE_AFTER_FAILURES
        # Consider disabling or alerting
        Rails.logger.warn("Webhook subscription #{subscription.id} has #{DISABLE_AFTER_FAILURES} consecutive failures, disabling")
        subscription.update!(enabled: false)
      end
    end
    private_class_method :check_subscription_health
  end
end
