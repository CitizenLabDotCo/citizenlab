# frozen_string_literal: true

module McpServer
  # Cross-tenant MCP channel for the internal staff gateway (admin-hq).
  #
  # Serves the same tool set as McpController, but over an internally
  # authenticated channel: instead of a per-tenant Doorkeeper token, the caller
  # presents the cluster's ADMIN_API_TOKEN and selects the tenant explicitly via
  # the X-Tenant-Host header (the /admin_api path prefix bypasses host-based
  # tenant switching, so the request starts in the public schema). Tool calls
  # run as an acting user resolved server-side; the real staff identity travels
  # in X-Acting-Staff and is recorded in the activity log.
  class InternalMcpController < ActionController::API
    INTERNAL_ACCOUNT_EMAIL = 'moderator@citizenlab.co'

    before_action :authenticate_request
    around_action :switch_tenant
    before_action :require_feature_and_acting_user

    def create
      server = MCP::Server.new(
        name: 'go_vocal_internal',
        title: "Go Vocal internal (#{AppConfiguration.instance.host})",
        version: '0.1.0',
        tools: tools
      )

      transport = MCP::Server::Transports::StreamableHTTPTransport.new(
        server,
        stateless: true,
        enable_json_response: true,
        # The public /mcp endpoint pins allowed_hosts to the tenant host, but this
        # channel is reached via cluster-internal hostnames that never match the
        # tenant host. DNS rebinding is a browser attack vector; this endpoint is
        # server-to-server and gated by a static secret, so allow the request host.
        allowed_hosts: [request.host]
      )

      status, headers, body = transport.handle_request(request)
      self.status = status
      self.response_body = body
      headers.each { |k, v| response.set_header(k, v) }

      log_tool_call_activity
    end

    private

    def authenticate_request
      expected = ENV.fetch('ADMIN_API_TOKEN', nil)
      provided = request.headers['Authorization'].to_s
      return if expected.present? && ActiveSupport::SecurityUtils.secure_compare(provided, expected)

      head :unauthorized
    end

    def switch_tenant(&)
      host = request.headers['X-Tenant-Host']
      tenant = host.presence && Tenant.find_by(host: host)
      return render(json: { error: "Unknown tenant host: #{host}" }, status: :not_found) unless tenant

      tenant.switch(&)
    end

    # Mirrors McpPolicy#create? (feature flag + active super admin), with explicit
    # error messages since the caller is our own gateway, not a generic MCP client.
    def require_feature_and_acting_user
      unless AppConfiguration.instance.feature_activated?('mcp_server')
        return render(json: { error: 'mcp_server feature is not activated for this tenant' }, status: :forbidden)
      end

      return if acting_user

      render json: { error: 'No eligible acting user on this tenant' }, status: :forbidden
    end

    # Prefer the staff member's own account on this tenant, fall back to the
    # shared internal account. Either way the account must be an active super
    # admin, the same bar the public MCP channel enforces.
    def acting_user
      @acting_user ||= [acting_staff_candidate, internal_account_candidate].compact.find do |user|
        user.active? && user.super_admin?
      end
    end

    def acting_staff_candidate
      email = request.headers['X-Acting-Staff']
      email.presence && User.find_by_cimail(email)
    end

    def internal_account_candidate
      User.find_by_cimail(INTERNAL_ACCOUNT_EMAIL)
    end

    def tools
      McpController::TOOL_CLASSES.map do |klass|
        klass.for(current_user: acting_user, token_scopes: %w[mcp:access])
      end
    end

    # Tenant-side audit trail: one activity per tools/call, attributed to the
    # acting user, with the real staff identity in the payload (the acting user
    # may be the shared internal account).
    def log_tool_call_activity
      return unless params[:method] == 'tools/call'

      LogActivityJob.perform_later(
        acting_user,
        'internal_mcp_tool_call',
        acting_user,
        Time.zone.now.to_i,
        payload: {
          tool: params.dig(:params, :name),
          acting_staff: request.headers['X-Acting-Staff']
        }
      )
    end
  end
end
