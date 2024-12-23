# frozen_string_literal: true

class SettingsService
  # Checks whether
  def dependencies_met?(settings, schema)
    missing_dependencies(settings, schema).empty?
  end

  # Given a settings object, add all missing feature objects from the schema
  def add_missing_features(settings, schema)
    missing_features = schema['properties'].keys - settings.keys
    if missing_features.empty?
      settings
    else
      res = settings.clone
      missing_features.each do |f|
        res[f] = {
          'allowed' => !!default_setting(schema, f, 'allowed'),
          'enabled' => !!default_setting(schema, f, 'enabled')
        }
      end
      res
    end
  end

  def add_missing_settings(settings, schema)
    res = settings.deep_dup
    settings.each_key do |feature|
      required_settings = schema.dig('properties', feature, 'required-settings') || []
      required_settings.each do |setting|
        if settings.dig(feature, setting).nil?
          default_value = default_setting(schema, feature, setting)
          res[feature][setting] = default_value unless default_value.nil?
        end
      end
    end
    res
  end

  def active_features(settings)
    settings
      .select { |_feature, obj| obj['enabled'] && obj['allowed'] }
      .map(&:first)
  end

  def missing_dependencies(settings, schema)
    active_features = active_features(settings)

    dependent_features = schema['dependencies'].flat_map do |depender, dependees|
      dependees if active_features.include? depender
    end.compact

    (dependent_features - active_features)
  end

  def remove_additional_features(settings, schema)
    additional_features = settings.keys - schema['properties'].keys
    settings.except(*additional_features)
  end

  def remove_additional_settings(settings, schema)
    res = settings.clone
    settings.each do |feature, feature_settings|
      additional_settings = feature_settings.keys - schema.dig('properties', feature, 'properties').keys
      res[feature].except!(*additional_settings)
    end
    res
  end

  def format_for_front_end(settings, schema)
    remove_private_settings(settings, schema)
  end

  def activate_feature!(feature, config: nil, settings: {})
    config ||= AppConfiguration.instance
    feature_settings = config.settings[feature] || {}
    config.settings[feature] = feature_settings.merge({ 'allowed' => true, 'enabled' => true })
    config.settings[feature].merge!(settings)
    config.save!
  end

  def deactivate_feature!(feature, config: nil)
    config ||= AppConfiguration.instance
    feature_settings = config.settings[feature]
    feature_settings['enabled'] = false if feature_settings
    config.save!
  end

  def minimal_required_settings(locales: ['en'], lifecycle_stage: 'demo')
    {
      core: {
        enabled: true,
        allowed: true,
        organization_type: 'generic',
        timezone: 'Europe/Brussels',
        currency: 'EUR',
        locales: locales,
        color_main: '#0A5159',
        color_secondary: '#008292',
        color_text: '#333',
        lifecycle_stage: lifecycle_stage,
        authentication_token_lifetime_in_days: 30
      }
    }
  end

  private

  def remove_private_settings(settings, schema)
    res = settings.deep_dup
    schema['properties'].each do |feature, feature_schema|
      feature_schema['properties'].each do |setting, setting_schema|
        res[feature]&.delete(setting) if setting_schema['private']
      end
    end
    res
  end

  def default_setting(schema, feature, setting)
    schema.dig('properties', feature, 'properties', setting, 'default')
  end
end

SettingsService.prepend(Verification::Patches::SettingsService)
