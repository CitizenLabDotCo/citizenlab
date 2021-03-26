module Moderation
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'moderation'
    end

    def self.feature_title
      'Moderation'
    end

    def self.feature_description
      'Moderations are pieces of user-generated content that need to be moderated.'
    end
  end
end
