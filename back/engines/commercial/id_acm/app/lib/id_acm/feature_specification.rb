# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdAcm
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'acm_login'
    end

    def self.feature_title
      'ACM Login (Oostende / itsme)'
    end

    def self.feature_description
      'Allow users to authenticate with itsme (Oostende).'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
