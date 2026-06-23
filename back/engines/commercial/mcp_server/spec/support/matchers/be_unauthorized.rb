# frozen_string_literal: true

# Matches an MCP tool response that signals an authorization failure:
# `isError: true` and a content block starting with the "Not allowed:" prefix
# emitted by McpServer::BaseTool#unauthorized_message.
#
# Optional argument narrows the match to a specific message (string or regex).
#
#   expect(response).to be_unauthorized
#   expect(response).to be_unauthorized(/not in draft/)
RSpec::Matchers.define :be_unauthorized do |expected_message = nil|
  match do |response|
    values_match?(be_error, response) &&
      response.content.any? do |c|
        text = c[:text]
        next false if text.nil?
        next false unless text.start_with?('Not allowed:')

        case expected_message
        when nil then true
        when String then text.include?(expected_message)
        else values_match?(expected_message, text)
        end
      end
  end

  failure_message do |response|
    if !values_match?(be_error, response)
      'expected response to be unauthorized, but it succeeded'
    elsif expected_message
      <<~MESSAGE.squish
        expected response to be unauthorized with message #{expected_message.inspect}, got:
        #{response_text(response).inspect}
      MESSAGE
    else
      "expected response to be unauthorized, got: #{response_text(response).inspect}"
    end
  end

  def response_text(response)
    response.content.filter_map { |c| c[:text] }.join(' / ')
  end
end

# Matches the authorization failure raised by +McpServer::BaseTool::Runner#authorize_project!+.
RSpec::Matchers.define :be_unauthorized_project do
  match(notify_expectation_failures: true) do |response|
    expect(response).to be_unauthorized(McpServer::BaseTool::Runner::NOT_DRAFT_MESSAGE)
    true
  end
end
