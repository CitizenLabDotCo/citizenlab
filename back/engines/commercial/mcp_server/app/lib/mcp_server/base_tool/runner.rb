# frozen_string_literal: true

# Runtime base class for MCP tools. Every Tool class nests a `Runner < BaseTool::Runner`
# whose `#run` method is the actual tool implementation.
class McpServer::BaseTool::Runner
  NOT_DRAFT_MESSAGE = 'Project is not in draft. On this platform, only draft projects can be ' \
                      'modified via MCP; published projects are only modifiable on demo and ' \
                      'trial platforms.'

  # Lifecycle stages on which the draft-only rule is lifted, so the MCP can also modify
  # published (and archived) projects. Never add 'active' here: live client platforms have
  # real participants, and modifying live projects must stay a human action there.
  PUBLISHED_WRITABLE_LIFECYCLES = %w[demo trial].freeze

  include Pundit::Authorization
  include McpServer::BaseTool::ResponseHelpers
  include McpServer::BaseTool::Pagination
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

  # CarrierWave ignores a plain nil assignment on `remote_<uploader>_url`, so an
  # explicit null means "remove the file" (the web API's remove_image_if_requested!
  # mechanism). Removes the matching uploads and returns the remaining attributes.
  def clear_uploaders!(record, attributes)
    record.class.uploaders.each_key do |uploader|
      key = :"remote_#{uploader}_url"
      next unless attributes.key?(key) && attributes[key].nil?

      record.public_send(:"remove_#{uploader}!")
      attributes = attributes.except(key)
    end

    attributes
  end

  # MCP-channel guard. Tools that mutate or destroy a project (or anything inside one)
  # must call this with the target's project before doing the work.
  def authorize_project!(project)
    return if project.admin_publication.draft?
    return if published_writable_platform?

    raise Pundit::NotAuthorizedErrorWithReason,
      reason: NOT_DRAFT_MESSAGE,
      message: NOT_DRAFT_MESSAGE
  end

  def published_writable_platform?
    PUBLISHED_WRITABLE_LIFECYCLES.include?(AppConfiguration.instance.lifecycle_stage)
  end
end
