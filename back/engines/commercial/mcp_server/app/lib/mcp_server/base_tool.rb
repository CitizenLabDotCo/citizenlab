# frozen_string_literal: true

class McpServer::BaseTool
  include McpServer::BaseTool::Multiloc
  include McpServer::BaseTool::Pagination

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

      runner = runner_class.new(
        params: kwargs,
        server_context: server_context,
        current_user: current_user,
        token_scopes: token_scopes
      )

      runner.run
    rescue Pundit::NotAuthorizedError => e
      runner.error(McpServer::BaseTool.unauthorized_message(e))
    end
  end

  def self.unauthorized_message(error)
    reason = error.respond_to?(:reason) ? error.reason : nil
    "Not allowed: #{reason || 'authorization failed'}."
  end
end
