module Navbar
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'navbar'
    end

    def self.feature_title
      'Navbar'
    end

    def self.feature_description
      'Navbar allows to edit and reposition the navbar items.'
    end
  end
end
