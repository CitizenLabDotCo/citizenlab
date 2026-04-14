# frozen_string_literal: true

module GVPlugins
  class ActivityJob < ApplicationJob
    queue_as :default

    def run(wasm_url, handler, activity_data, plugin_name, provision_public_api_token)
      PluginRunnerService.new.invoke(
        wasm_url: wasm_url,
        handler: handler,
        input: { activity: activity_data },
        plugin_name: plugin_name,
        provision_public_api_token: provision_public_api_token
      )
    end
  end
end
