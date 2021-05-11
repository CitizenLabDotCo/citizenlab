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

    add_setting 'flag_inappropriate_content', required: true, schema: {
      'title': 'Flag Inappropriate Content',
      'type': 'boolean',
      'description': 'Mark content when toxicity was detected or when reported as spam.',
      'default': true
    }
  end
end
