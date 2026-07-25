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

        label ? text.include?("#{label} not found") : text.match?(/not found/i)
      end
  end

  failure_message do |response|
    if !values_match?(be_error, response)
      'expected response to be a not-found error, but it succeeded'
    else
      expected = label ? "a '#{label} not found' error" : 'a not-found error'
      "expected #{expected}, got: #{response_text(response).inspect}"
    end
  end

  def response_text(response)
    response.content.filter_map { |c| c[:text] }.join(' / ')
  end
end
