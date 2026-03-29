# frozen_string_literal: true

module GVPlugins
  module WebApi
    module V1
      class PluginsController < ApplicationController
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized

        def front_entries
          service = PluginManifestService.new
          entries = service.front_entries.map do |entry|
            OpenStruct.new(
              id: entry[:id],
              url: gv_plugins.web_api_v1_plugin_front_entry_path(entry[:id])
            )
          end

          render json: GVPlugins::WebApi::V1::PluginFrontEntrySerializer.new(entries).serializable_hash
        end

        # Proxies the plugin's front-end JS file through the backend. This is
        # necessary because the plugin host (e.g. host.docker.internal) may not
        # be reachable from the browser. By proxying, only the backend needs
        # network access to the plugin host; the browser loads scripts from the
        # backend origin, which it can always reach.
        def front_entry
          body = PluginManifestService.new.fetch_front_entry(params[:id])

          if body
            render body: body, content_type: 'application/javascript'
          else
            head :not_found
          end
        end
      end
    end
  end
end
