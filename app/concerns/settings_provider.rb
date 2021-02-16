# frozen_string_literal: true

# Helper mixin for settings management.
# You can either define +SettingsProvider.settings_json_schema_str+ or
# +SettingsProvider.settings_json_schema+, and the other one comes for 
# free.
module SettingsProvider
  # @return [String]
  def settings_json_schema_str
    @settings_json_schema_str ||= JSON.dump(settings_json_schema)
  end

  def settings_json_schema
    @settings_json_schema ||= JSON.parse(settings_json_schema_str)
  end
end
