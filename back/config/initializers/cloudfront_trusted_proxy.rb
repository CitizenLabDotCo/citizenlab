# frozen_string_literal: true

# cloudfront-rails checks each X-Forwarded-For entry against CloudFront's IP
# ranges with `IPAddr#===`, which raises on anything that isn't an IP. Clients
# control that header, so a blank or `localhost` entry would 500 the request
# inside middleware, where no controller can rescue it. An entry that isn't an
# IP can't be in CloudFront's ranges, so fall back to Rack's own check.
module CloudfrontTrustedProxyGuard
  def trusted_proxy?(ip)
    super
  rescue IPAddr::InvalidAddressError
    Rack::Request.ip_filter.call(ip)
  end
end

Rack::Request::Helpers.prepend(CloudfrontTrustedProxyGuard)
