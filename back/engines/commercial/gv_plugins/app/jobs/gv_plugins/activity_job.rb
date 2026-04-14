# frozen_string_literal: true

module GVPlugins
  class ActivityJob < ApplicationJob
    queue_as :default

    def run(wasm_url, handler, activity_data)
      PluginRunnerService.new.invoke(
        wasm_url: wasm_url,
        handler: handler,
        input: activity_data
      )
    end
  end
end
