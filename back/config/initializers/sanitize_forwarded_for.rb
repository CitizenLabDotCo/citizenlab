# frozen_string_literal: true

require Rails.root.join('lib/middleware/sanitize_forwarded_for')

# Must run before ActionDispatch::RemoteIp so malformed headers are cleaned before IP resolution.
Rails.application.config.middleware.insert_before(
  ActionDispatch::RemoteIp,
  Middleware::SanitizeForwardedFor
)
