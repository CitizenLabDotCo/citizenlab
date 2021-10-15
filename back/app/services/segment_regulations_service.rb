# frozen_string_literal: true

class SegmentRegulationsClient

  REGULATION_TYPES = {
    suppress_with_delete: 'Suppress_With_Delete',
    delete: 'Delete',
    unsuppress: 'Unsuppress',
    suppress: 'Suppress',
    delete_internal: 'Delete_Internal',
  }.freeze

  # @param [String,nil] authorization_token A "Workspace Owner" token is
  #   necessary to create, edit or delete regulations. See
  #   https://app.segment.com/citizen-lab/settings/access-management/tokens.
  # @param [String] workspace The slug of the segment workspace.
  def initialize(authorization_token: nil, workspace: 'citizen-lab')
    @authorization_token = authorization_token || ENV.fetch('SEGMENT_AUTHORIZATION_TOKEN')
    @workspace = workspace
  rescue KeyError
    raise MissingAuthorizationTokenError
  end

  # @param [Array<String>] user_ids
  def suppress_with_delete(user_ids)
    create_regulation(:suppress_with_delete, user_ids)
  end

  def create_regulation(regulation_type, user_ids)
    regulation = regulation_body(regulation_type, user_ids)

    HTTParty.post(
      "https://platform.segmentapis.com/v1beta/workspaces/#{@workspace}/regulations",
      body: regulation.to_json,
      headers: headers
    )
  end

  private

  def regulation_body(regulation_type, user_ids)
    {
      regulation_type: REGULATION_TYPES.fetch(regulation_type),
      attributes: { name: 'userId', values: user_ids }
    }
  rescue KeyError => e
    raise BadRegulationTypeError("unknown regulation type: #{e.key}", e.key)
  end

  def headers
    {
      Authorization: "Bearer #{@authorization_token}",
      'Content-Type': 'application/json'
    }
  end

  class BadRegulationTypeError < StandardError
    def initialize(message, regulation_type)
      @regulation_type = regulation_type
      super(message)
    end
  end

  class MissingAuthorizationTokenError < StandardError; end
end
