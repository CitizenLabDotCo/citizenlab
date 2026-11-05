# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module McpServer
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'mcp_server'
    end

    def self.feature_title
      'MCP Server'
    end

    def self.feature_description
      'Exposes an MCP (Model Context Protocol) server endpoint.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
