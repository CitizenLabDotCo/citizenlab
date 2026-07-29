# frozen_string_literal: true

class McpServer::BaseTool
  include McpServer::BaseTool::Multiloc
  include McpServer::BaseTool::Pagination

  READ_ANNOTATIONS = {
    read_only_hint: true,
    destructive_hint: false,
    idempotent_hint: true,
    open_world_hint: false
  }.freeze

  # Expected user-facing outcomes (bad input, missing records), not bugs — never reported
  # to Sentry. Pundit is handled separately, before it reaches the Sentry rescue.
  EXPECTED_ERRORS = [ActiveRecord::RecordInvalid, ActiveRecord::RecordNotFound].freeze

  attr_reader :current_user, :token_scopes

  def initialize(current_user: nil, token_scopes: [])
    @current_user = current_user
    @token_scopes = token_scopes
  end

  # Subclasses MUST override these.
  def name = raise NotImplementedError
  def description = raise NotImplementedError
  def input_schema = raise NotImplementedError

  # Subclasses MAY override these.
  def title = name.humanize
  def output_schema = nil
  def icons = []
  def meta = nil
  def annotations = nil

  # Called once per request and per tool, by the controller.
  # Builds the SDK-side tool class dynamically.
  def self.for(current_user:, token_scopes:)
    definition = new(current_user:, token_scopes:)
    runner_class = const_get(:Runner)

    MCP::Tool.define(
      name: definition.name,
      title: definition.title,
      description: definition.description,
      icons: definition.icons,
      input_schema: definition.input_schema,
      output_schema: definition.output_schema,
      meta: definition.meta,
      annotations: definition.annotations
    ) do |**kwargs|
      server_context = kwargs.delete(:server_context)
      params = ReadonlyStrip.strip_readonly(kwargs, definition.input_schema)
      runner = runner_class.new(params:, server_context:, current_user:, token_scopes:)

      # Tag activities from this tool run as MCP-originated (LogActivityJob reads this).
      # Set here, not in McpController, so the run_mcp_tool spec helper hits the same path.
      Current.activity_channel = 'mcp'

      locale_error = McpServer::LocaleGuard.error_message(kwargs)
      locale_error ? runner.error(locale_error) : runner.run
    rescue Pundit::NotAuthorizedError => e
      runner.error(McpServer::BaseTool.unauthorized_message(e))
    rescue StandardError => e
      # Report genuine failures to Sentry, then re-raise (transport response unchanged).
      # Expected user errors are skipped — see report_tool_error. Tenant/user/tool
      # context travels via Sentry tags set on the request (see set_sentry_context
      # in McpController and InternalMcpController).
      McpServer::BaseTool.report_tool_error(e)
      raise
    ensure
      # Clear the tag so it can't leak to later work on this thread (e.g. across specs).
      Current.activity_channel = nil
    end
  end

  def self.unauthorized_message(error)
    reason = error.try(:reason)
    "Not allowed: #{reason || 'authorization failed.'}"
  end

  def self.report_tool_error(error)
    return if EXPECTED_ERRORS.any? { |klass| error.is_a?(klass) }

    ErrorReporter.report(error)
  end
end
