class SettingsService

  # Checks whether
  def dependencies_met? settings, schema
    missing_dependencies(settings, schema).empty?
  end

  # Given a settings object, add all missing feature objects from the schema
  def add_missing_features settings, schema
    missing_features = schema["properties"].keys - settings.keys
    if (missing_features).empty?
      settings
    else
      res = settings.deep_dup
      missing_features.each do |f|
        res[f] = {
          "allowed" => false,
          "enabled" => false
        }
      end
      res
    end
  end

  def active_features settings
    settings
    .select{|feature, obj| obj["enabled"] && obj["allowed"]}
      .map(&:first)
  end


  def missing_dependencies settings, schema
    active_features = active_features(settings)

    dependent_features = schema["dependencies"].flat_map do |depender, dependees|
      dependees if active_features.include? depender
    end.compact

    (dependent_features - active_features)
  end


end
