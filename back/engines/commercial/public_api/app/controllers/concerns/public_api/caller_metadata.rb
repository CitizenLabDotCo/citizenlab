# frozen_string_literal: true

module PublicApi
  # Adds the caller's identity to the log payload, so usage can be attributed per
  # tenant and per integration. An integration is identified by its user agent,
  # or by APP_HEADER where it sets one.
  module CallerMetadata
    APP_HEADER = 'X-GoVocal-Client'

    def append_caller_info(payload, api_client_id)
      payload[:tenant_id] = Tenant.safe_current&.id
      payload[:tenant_host] = Tenant.safe_current&.host
      payload[:api_client_id] = api_client_id
      payload[:user_agent] = request.user_agent
      payload[:api_client_app] = request.headers[APP_HEADER]
    end
  end
end
