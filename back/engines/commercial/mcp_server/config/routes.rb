# frozen_string_literal: true

McpServer::Engine.routes.draw do
  post '/', to: 'mcp#create'
end

Rails.application.routes.draw do
  mount McpServer::Engine => '/mcp', as: 'mcp_server'
end
