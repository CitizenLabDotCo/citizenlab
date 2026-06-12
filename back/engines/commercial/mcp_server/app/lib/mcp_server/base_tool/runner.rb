# frozen_string_literal: true

# Runtime base class for MCP tools. Every Tool class nests a `Runner < BaseTool::Runner`
# whose `#run` method is the actual tool implementation.
class McpServer::BaseTool::Runner
  include McpServer::BaseTool::ResponseHelpers
  include McpServer::BaseTool::Pagination

  attr_reader :params, :server_context, :current_user, :token_scopes

  def initialize(params:, server_context:, current_user:, token_scopes: [])
    @params = params
    @server_context = server_context
    @current_user = current_user
    @token_scopes = token_scopes
  end

  def run
    raise NotImplementedError, 'Subclasses must implement #run'
  end

  private

  # Assigns attributes through setters (so any custom setter/normalization runs).
  # `*_multiloc` fields merge per-locale (locales the caller didn't pass are kept); others replace.
  # Callers should reject unknown/non-updatable keys before calling this.
  def apply_attributes(record, attributes)
    attributes.each do |key, value|
      current = record.public_send(key)
      merge = key.to_s.end_with?('_multiloc') && current.is_a?(Hash) && value.is_a?(Hash)
      record.public_send(:"#{key}=", merge ? current.merge(value) : value)
    end
  end
end
