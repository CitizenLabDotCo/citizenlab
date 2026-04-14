# frozen_string_literal: true

module GVPlugins
  class PluginRunnerService
    def call(wasm_url:, handler:, request_data:)
      output = invoke(wasm_url: wasm_url, handler: handler, input: request_data)
      JSON.parse(output)
    rescue Extism::Error => e
      { 'status' => 500, 'headers' => {}, 'body' => { 'error' => e.message } }
    end

    def invoke(wasm_url:, handler:, input:)
      manifest = Extism::Manifest.from_url(wasm_url)
      plugin = Extism::Plugin.new(manifest, wasi: true)

      json_input = JSON.generate(input)
      plugin.call(handler, json_input)
    ensure
      plugin&.close if plugin.respond_to?(:close)
    end
  end
end
