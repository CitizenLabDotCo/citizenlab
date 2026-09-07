# frozen_string_literal: true

module McpServer
  module LifecycleStageSpecSupport
    # Sets the tenant's lifecycle stage for the current example. Writes with
    # update_column because AppConfiguration refuses normal saves that change the
    # stage from or to 'demo'.
    def change_lifecycle_stage(stage)
      config = AppConfiguration.instance
      config.settings['core']['lifecycle_stage'] = stage
      config.update_column(:settings, config.settings)
    end
  end
end

RSpec.configure do |config|
  config.include McpServer::LifecycleStageSpecSupport
end
