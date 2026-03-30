# frozen_string_literal: true

module GVPlugins
  module WebApi
    module V1
      class PluginProxyController < ApplicationController
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized

        def handle
          debugger
          plugin_name = params[:plugin_name]
          path = params[:path]

          match = PluginManifestService.new.find_handler(plugin_name, request.method, path)

          if match.nil?
            head :not_found
            return
          end

          request_data = {
            method: request.method,
            path: "/#{path}",
            headers: extract_headers,
            query: request.query_parameters,
            body: request.raw_post.presence
          }

          result = PluginRunnerService.new.call(
            wasm_url: match[:wasm_url],
            handler: match[:handler],
            request_data: request_data
          )

          status = result['status'] || 200
          headers = result['headers'] || {}
          body = result['body']

          headers.each { |key, value| response.set_header(key, value) }
          render json: body, status: status
        end

        private

        def extract_headers
          request.headers.env
            .select { |k, _| k.start_with?('HTTP_') }
            .transform_keys { |k| k.sub('HTTP_', '').tr('_', '-').downcase }
        end
      end
    end
  end
end
