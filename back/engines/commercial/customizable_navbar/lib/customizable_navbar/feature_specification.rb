module CustomizableNavbar
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'customizable_navbar'
    end

    def self.feature_title
      'Customizable Navbar'
    end

    def self.feature_description
      'Add, remove, reposition and rename items in the navbar'
    end
  end
end
