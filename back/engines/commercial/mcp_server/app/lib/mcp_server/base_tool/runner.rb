# frozen_string_literal: true

# Runtime base class for MCP tools. Every Tool class nests a `Runner < BaseTool::Runner`
# whose `#run` method is the actual tool implementation.
class McpServer::BaseTool::Runner
  NOT_DRAFT_MESSAGE = 'Project is not in draft. Only draft projects can be modified via MCP.'

  include McpServer::BaseTool::ResponseHelpers
  include McpServer::BaseTool::Pagination
  include McpServer::BaseTool::Authorization
  include McpServer::BaseTool::MultilocMerge

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

  # MCP-channel guard. Tools that mutate or destroy a project (or anything inside one)
  # must call this with the target's project before doing the work.
  def authorize_project!(project)
    return if project.admin_publication.draft?

    raise Pundit::NotAuthorizedErrorWithReason,
      reason: NOT_DRAFT_MESSAGE,
      message: NOT_DRAFT_MESSAGE
  end
end
