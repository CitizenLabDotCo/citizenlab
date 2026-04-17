# frozen_string_literal: true

module GVPlugins
  module Patches
    module LogActivityJob
      def run(item, action, user, acted_at = nil, options = {})
        result = super

        manifest_service = PluginManifestService.new
        return result unless manifest_service.plugins_configured?

        if item.is_a?(String)
          item_class, item_id = decode_frozen_resource(item)
          item_type = item_class.name
        else
          item_type = item.class.name
          item_id = item.id
        end
        event_name = "#{item_type.underscore}.#{action}"

        handlers = manifest_service.find_event_handlers(event_name)
        return result if handlers.empty?

        activity_data = {
          type: event_name,
          payload: {
            item_type: item_type,
            item_id: item_id,
            action: action,
            user_id: user&.id,
            acted_at: acted_at,
            data: options[:payload] || {}
          }
        }

        handlers.each do |h|
          GVPlugins::ActivityJob.perform_later(
            h[:wasm_url],
            h[:handler],
            activity_data,
            h[:plugin_name],
            h[:provision_public_api_token],
            h[:allowed_hosts]
          )
        end

        result
      end
    end
  end
end
