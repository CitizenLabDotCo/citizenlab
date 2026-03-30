# frozen_string_literal: true

module GVPlugins
  class PluginRunnerService
    def call(wasm_url:, handler:, request_data:)
      manifest = Extism::Manifest.from_url(wasm_url)
      plugin = Extism::Plugin.new(manifest, wasi: true)

      input = JSON.generate(request_data)
      output = plugin.call(handler, input)

      JSON.parse(output)
    rescue Extism::Error => e
      { 'status' => 500, 'headers' => {}, 'body' => { 'error' => e.message } }
    ensure
      plugin&.close if plugin.respond_to?(:close)
    end
  end
end
