# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdClaveUnica
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'clave_unica_login'
    end

    def self.feature_title
      'ClaveUnica Login'
    end

    def self.feature_description
      'Allow users to authenticate and verify with a ClaveUnica account.'
    end

    add_setting 'client_id', schema: {
      title: 'Client ID',
      type: 'string',
      private: true
    }

    add_setting 'client_secret', schema: {
      title: 'Client Secret',
      type: 'string',
      private: true
    }
  end
end
