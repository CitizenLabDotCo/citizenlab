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
