# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdTwoday
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'twoday_login'
    end

    def self.feature_title
      'Twoday (Helsingborg) Login'
    end

    def self.feature_description
      'Allow users to authenticate with a Swedish BankID or FrejaID (via Twoday).'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
