# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdBosaFas
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'bosa_fas_login'
    end

    def self.feature_title
      'Bosa Fas (CSAM) Login'
    end

    def self.feature_description
      'Allow users to authenticate and verify with a Bosa Fas (CSAM) account (Belgium).'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
