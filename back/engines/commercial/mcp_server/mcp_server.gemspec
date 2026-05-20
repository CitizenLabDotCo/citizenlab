# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

require 'mcp_server/version'

Gem::Specification.new do |s|
  s.name        = 'mcp_server'
  s.version     = McpServer::VERSION
  s.authors     = ['CitizenLab']
  s.summary     = 'MCP server for CitizenLab'
  s.licenses    = [Gem::Licenses::NONSTANDARD]

  s.files = Dir['{app,config,lib}/**/*']

  s.add_dependency 'mcp', '~> 0.16'
  s.add_dependency 'rails', '~> 7.2'
end
