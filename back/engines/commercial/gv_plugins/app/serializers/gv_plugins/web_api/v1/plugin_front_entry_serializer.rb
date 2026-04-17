# frozen_string_literal: true

class GVPlugins::WebApi::V1::PluginFrontEntrySerializer < WebApi::V1::BaseSerializer
  set_type :plugin_front_entry

  set_id :id

  attribute :url
end
