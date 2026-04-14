# frozen_string_literal: true

module GVPlugins
  class PluginRunnerService
    def call(wasm_url:, handler:, request_data:, plugin_name:, provision_public_api_token: false)
      output = invoke(
        wasm_url: wasm_url,
        handler: handler,
        input: request_data,
        plugin_name: plugin_name,
        provision_public_api_token: provision_public_api_token
      )
      JSON.parse(output)
    rescue Extism::Error => e
      { 'status' => 500, 'headers' => {}, 'body' => { 'error' => e.message } }
    end

    def invoke(wasm_url:, handler:, input:, plugin_name:, provision_public_api_token: false)
      enriched_input = enrich_input(input, plugin_name, provision_public_api_token)
      manifest = build_manifest(wasm_url, provision_public_api_token)
      plugin = Extism::Plugin.new(manifest, wasi: true)

      json_input = JSON.generate(enriched_input)
      plugin.call(handler, json_input)
    ensure
      plugin&.close if plugin.respond_to?(:close)
    end

    private

    def enrich_input(input, plugin_name, provision_token)
      return input unless provision_token

      input.merge(
        public_api_jwt: PluginApiTokenService.new.mint_jwt(plugin_name),
        public_api_url: "#{AppConfiguration.instance.base_backend_uri}/api/v2"
      )
    end

    def build_manifest(wasm_url, provision_token)
      data = { wasm: [{ url: wasm_url }] }
      data[:allowed_hosts] = [URI.parse(AppConfiguration.instance.base_backend_uri).host] if provision_token
      Extism::Manifest.new(data)
    end
  end
end
