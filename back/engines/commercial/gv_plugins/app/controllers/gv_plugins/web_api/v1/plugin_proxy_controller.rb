# frozen_string_literal: true

module GVPlugins
  module WebApi
    module V1
      class PluginProxyController < ApplicationController
        skip_before_action :authenticate_user
        skip_after_action :verify_authorized

        def handle
          plugin_name = params[:plugin_name]
          path = params[:path]

          match = PluginManifestService.new.find_handler(plugin_name, request.method, path)

          if match.nil?
            head :not_found
            return
          end

          input_data = {
            request: {
              method: request.method,
              path: "/#{path}",
              headers: extract_headers,
              query: request.query_parameters,
              body: request.raw_post.presence
            },
            current_user: serialize_current_user
          }

          result = PluginRunnerService.new.call(
            wasm_url: match[:wasm_url],
            handler: match[:handler],
            request_data: input_data,
            plugin_name: match[:plugin_name],
            provision_public_api_token: match[:provision_public_api_token]
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

        def serialize_current_user
          return nil unless current_user

          {
            id: current_user.id,
            email: current_user.email,
            first_name: current_user.first_name,
            last_name: current_user.last_name,
            locale: current_user.locale,
            roles: current_user.roles
          }
        end
      end
    end
  end
end
