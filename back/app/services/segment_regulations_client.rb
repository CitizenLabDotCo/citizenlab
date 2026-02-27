# frozen_string_literal: true

class SegmentRegulationsClient
  # All deletion and suppression actions in Segment are asynchronous,
  # and categorized as *Regulations*.
  #
  # We created this new service instead of extending TrackSegmentService
  # because the APIs for data collection and the 'regulation' API are using
  # different authentication schemes.

  # See https://reference.segmentapis.com/?version=latest#57a69434-76cc-43cc-a547-98c319182247
  # for more information about regulations.
  REGULATION_TYPES = {
    suppress_with_delete: 'Suppress_With_Delete', # Suppress new data and delete existing data
    delete: 'Delete',                             # Delete existing data without suppressing any new data
    unsuppress: 'Unsuppress',                     # Stop an ongoing suppression
    suppress: 'Suppress',                         # Suppress new data without deleting existing data
    delete_internal: 'Delete_Internal'            # Delete data from Segment internals only
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
  def delete(user_ids)
    create_regulation(:delete, user_ids)
  end

  # @param [Symbol] regulation_type
  # @param [Array<String>] user_ids
  def create_regulation(regulation_type, user_ids)
    regulation = regulation_body(regulation_type, user_ids)

    HTTParty.post(
      "https://platform.segmentapis.com/v1beta/workspaces/#{@workspace}/regulations",
      body: regulation.to_json,
      headers: headers
    )
  end

  # @param [String] regulation_id
  def delete_regulation(regulation_id)
    HTTParty.delete(
      "https://platform.segmentapis.com/v1beta/workspaces/#{@workspace}/regulations/#{regulation_id}",
      headers: headers
    )
  end

  private

  # @param [Symbol] regulation_type
  # @param [Array<String>] user_ids
  # @return [Hash{Symbol->Anything}}]
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
    attr_reader :regulation_type

    def initialize(message, regulation_type)
      @regulation_type = regulation_type
      super(message)
    end
  end

  class MissingAuthorizationTokenError < StandardError; end
end
