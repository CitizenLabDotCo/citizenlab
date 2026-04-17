# frozen_string_literal: true

module GVPlugins
  module Patches
    module LogActivityJob
      extend ActiveSupport::Concern

      included do
        after_perform do |job|
          GVPlugins::Patches::LogActivityJob.dispatch_plugin_handlers(job, *job.arguments)
        end
      end

      def self.dispatch_plugin_handlers(job, item, action, user = nil, acted_at = nil, options = {})
        manifest_service = PluginManifestService.new
        return unless manifest_service.plugins_configured?

        if item.is_a?(String)
          item_class, item_id = job.send(:decode_frozen_resource, item)
          item_type = item_class.name
        else
          item_type = item.class.name
          item_id = item.id
        end
        event_name = "#{item_type.underscore}.#{action}"

        handlers = manifest_service.find_event_handlers(event_name)
        return if handlers.empty?

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
      end
    end
  end
end
