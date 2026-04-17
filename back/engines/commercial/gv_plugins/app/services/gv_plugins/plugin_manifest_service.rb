# frozen_string_literal: true

require 'net/http'
require 'json'

module GVPlugins
  class PluginManifestService
    def front_entries
      plugin_urls = AppConfiguration.instance.settings.dig('plugins', 'active_plugins') || []

      plugin_urls.each_with_index.filter_map do |plugin, index|
        manifest = fetch_manifest(plugin['url'])
        next unless manifest

        front_entry = manifest.dig('front', 'entry')
        next unless front_entry

        { id: index.to_s, url: resolve_url(plugin['url'], front_entry) }
      end
    end

    def fetch_front_entry(plugin_index)
      entries = front_entries
      entry = entries.find { |e| e[:id] == plugin_index.to_s }
      return nil unless entry

      fetch_file(entry[:url])
    end

    def back_plugins
      plugin_urls = AppConfiguration.instance.settings.dig('plugins', 'active_plugins') || []

      plugin_urls.filter_map do |plugin|
        manifest = fetch_manifest(plugin['url'])
        next unless manifest
        next unless manifest['back']

        back = manifest['back']
        wasm_url = resolve_url(plugin['url'], back['entry'])
        routes = (back['routes'] || []).map do |route|
          { method: route['method'].upcase, path: route['path'], handler: route['handler'] }
        end

        {
          name: manifest['name'],
          wasm_url: wasm_url,
          routes: routes,
          provision_public_api_token: back['provision_public_api_token'] == true,
          allowed_hosts: Array(back['allowed_hosts'])
        }
      end
    end

    def find_handler(plugin_name, request_method, path)
      plugin = back_plugins.find { |p| p[:name] == plugin_name }
      return nil unless plugin

      route = plugin[:routes].find do |r|
        r[:method] == request_method.upcase && r[:path] == "/#{path}"
      end
      return nil unless route

      {
        plugin_name: plugin[:name],
        wasm_url: plugin[:wasm_url],
        handler: route[:handler],
        provision_public_api_token: plugin[:provision_public_api_token],
        allowed_hosts: plugin[:allowed_hosts]
      }
    end

    def event_handlers
      plugin_urls = AppConfiguration.instance.settings.dig('plugins', 'active_plugins') || []

      plugin_urls.flat_map do |plugin|
        manifest = fetch_manifest(plugin['url'])
        next [] unless manifest&.dig('back', 'events')

        back = manifest['back']
        wasm_url = resolve_url(plugin['url'], back['entry'])
        provision = back['provision_public_api_token'] == true
        allowed_hosts = Array(back['allowed_hosts'])
        back['events'].map do |event|
          {
            plugin_name: manifest['name'],
            event_name: event['name'],
            wasm_url: wasm_url,
            handler: event['handler'],
            provision_public_api_token: provision,
            allowed_hosts: allowed_hosts
          }
        end
      end
    end

    def find_event_handlers(event_name)
      event_handlers.select { |h| h[:event_name] == event_name }
    end

    # Cheap check used to skip plugin work when no plugins could possibly run.
    def plugins_configured?
      settings = AppConfiguration.instance.settings
      settings.dig('plugins', 'enabled') &&
        (settings.dig('plugins', 'active_plugins') || []).any?
    end

    private

    def fetch_manifest(manifest_url)
      uri = URI.parse(manifest_url)
      response = Net::HTTP.get_response(uri)

      return nil unless response.is_a?(Net::HTTPSuccess)

      JSON.parse(response.body)
    rescue URI::InvalidURIError, JSON::ParserError, Errno::ECONNREFUSED, Net::OpenTimeout, Net::ReadTimeout
      nil
    end

    def resolve_url(manifest_url, relative_entry)
      manifest_uri = URI.parse(manifest_url)
      manifest_uri.merge(relative_entry).to_s
    end

    def fetch_file(url)
      uri = URI.parse(url)
      response = Net::HTTP.get_response(uri)

      return nil unless response.is_a?(Net::HTTPSuccess)

      response.body
    rescue URI::InvalidURIError, Errno::ECONNREFUSED, Net::OpenTimeout, Net::ReadTimeout
      nil
    end
  end
end
