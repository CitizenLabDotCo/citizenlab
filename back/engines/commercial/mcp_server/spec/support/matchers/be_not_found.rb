# frozen_string_literal: true

# Matches an MCP tool error response emitted by
# McpServer::BaseTool::ResponseHelpers#not_found_error.
#
# Optional argument narrows the match to a specific label:
#
#   expect(response).to be_not_found
#   expect(response).to be_not_found('Project')
#   expect(response).to be_not_found('Resource (phase)')
RSpec::Matchers.define :be_not_found do |label = nil|
  match do |response|
    values_match?(be_error, response) &&
      response.content.any? do |c|
        text = c[:text]
        next false if text.nil?

        anchor = "#{label} not found".strip
        text.include?(anchor)
      end
  end

  failure_message do |response|
    if !values_match?(be_error, response)
      'expected response to be a not-found error, but it succeeded'
    else
      anchor = "#{label} not found".strip
      "expected a '#{anchor}' error, got: #{response_text(response).inspect}"
    end
  end

  def response_text(response)
    response.content.filter_map { |c| c[:text] }.join(' / ')
  end
end
