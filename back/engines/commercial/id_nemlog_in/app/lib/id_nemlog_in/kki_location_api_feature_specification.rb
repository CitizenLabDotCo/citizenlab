# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdNemlogIn
  module KkiLocationApiFeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'kki_location_api'
    end

    def self.feature_title
      'Danish (Copenhagen) KKI location API'
    end

    def self.feature_description
      "Use Danish CPR number fetched from Nemlog-in (or potentially any other source) to get citizen's municipality code via Copenhagen KKI service."
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    add_setting 'uri', required: true, schema: {
      title: 'API URI',
      type: 'string',
      private: true
    }

    add_setting 'username', required: true, schema: {
      title: 'Basic Auth username',
      type: 'string',
      private: true
    }

    add_setting 'password', required: true, schema: {
      title: 'Basic Auth password',
      type: 'string',
      private: true
    }

    add_setting 'custom_headers', required: false, schema: {
      title: 'Any custom headers in this format (no quotes): "Ocp-Apim-Subscription-Key: 6c7924f0cfbde464d1ae2169c2a5eb84, HEADER2: VALUE2"',
      type: 'string',
      private: true
    }
  end
end
