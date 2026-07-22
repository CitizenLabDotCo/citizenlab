# frozen_string_literal: true

$LOAD_PATH.push File.expand_path('lib', __dir__)

require 'mcp_server/version'

Gem::Specification.new do |s|
  s.name        = 'mcp_server'
  s.version     = McpServer::VERSION
  s.authors     = ['Go Vocal']
  s.summary     = 'MCP server for Go Vocal'
  s.licenses    = [Gem::Licenses::NONSTANDARD]

  s.files = Dir['{app,config,lib}/**/*']

  s.add_dependency 'mcp', '~> 0.16'
  s.add_dependency 'pg_query', '~> 6.0'
  s.add_dependency 'rails', '~> 7.2'
end
