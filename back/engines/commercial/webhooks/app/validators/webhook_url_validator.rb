# frozen_string_literal: true

require 'uri'
require 'resolv'
require 'ipaddr'

class WebhookUrlValidator < ActiveModel::EachValidator
  # Block private IP ranges (RFC 1918, loopback, link-local, etc.)
  BLOCKED_IP_RANGES = [
    IPAddr.new('127.0.0.0/8'),      # Loopback
    IPAddr.new('::1/128'),          # IPv6 loopback
    IPAddr.new('10.0.0.0/8'),       # Private class A
    IPAddr.new('172.16.0.0/12'),    # Private class B
    IPAddr.new('192.168.0.0/16'),   # Private class C
    IPAddr.new('169.254.0.0/16'),   # Link-local (AWS metadata!)
    IPAddr.new('169.254.169.254/32'), # AWS/GCP/Azure metadata
    IPAddr.new('fd00::/8'),         # IPv6 private
    IPAddr.new('0.0.0.0/8'),        # Current network
    IPAddr.new('fe80::/10')         # IPv6 link-local
  ].freeze

  def validate_each(record, attribute, value)
    return if value.blank?

    begin
      uri = URI.parse(value)
    rescue URI::InvalidURIError
      record.errors.add(attribute, 'is not a valid URL')
      return
    end

    # Require HTTPS (or HTTP in development)
    unless valid_scheme?(uri.scheme)
      record.errors.add(attribute, 'must use HTTPS')
      return
    end

    # Validate hostname exists
    if uri.host.blank?
      record.errors.add(attribute, 'must include a hostname')
      return
    end

    # Resolve DNS and check against blocklist
    begin
      addresses = Resolv.getaddresses(uri.host)

      if addresses.empty?
        record.errors.add(attribute, 'hostname does not resolve')
        return
      end

      addresses.each do |addr_string|
        ip = IPAddr.new(addr_string)

        # Allow localhost in development only
        if private_ip?(ip) && !Rails.env.development?
          record.errors.add(attribute, 'cannot be an internal or private address')
          break
        end
      end
    rescue Resolv::ResolvError
      record.errors.add(attribute, 'hostname does not resolve')
    rescue ArgumentError => e
      record.errors.add(attribute, "invalid IP address: #{e.message}")
    end
  end

  private

  def valid_scheme?(scheme)
    return false if scheme.blank?

    if Rails.env.development?
      %w[http https].include?(scheme.downcase)
    else
      scheme.downcase == 'https'
    end
  end

  def private_ip?(ip)
    BLOCKED_IP_RANGES.any? { |range| range.include?(ip) }
  end
end
