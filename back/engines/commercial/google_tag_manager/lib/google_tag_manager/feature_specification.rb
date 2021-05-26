module GoogleTagManager # Engine namespace
  module FeatureSpecification
    # Note that we are extending (not including) here!
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name # will be used as the property key in the main settings json schema
      'google_tag_manager'
    end

    def self.feature_title
      'Google Tag Manager Integration'
    end

    def self.feature_description # optional
      <<~DESC
        Enables integrating to google tag manager
      DESC
    end

    # Adding settings to the feature
    add_setting 'destinations', schema: {
      "type": "string",
      "description": "As more tools can be activated through GTM, here you can specify them using comma separated text, shown in the cookie consent",
    }
    add_setting 'container_id', schema: {
      "type": "string",
      "description": "The unique ID of your GTM workspace, format GTM-XXXXXXX",
      "pattern": "^GTM-[A-Z0-9]{1,7}$",
      "default": ENV.fetch('DEFAULT_GTM_CONTAINER_ID', '')
    }
    add_setting 'category', schema: {
      "type": "string",
      "description": "In which category should GTM appear in the consent manager ?",
      "enum": ["advertising", "analytics", "functional"],
      "default": "analytics"
    }
  end
end
