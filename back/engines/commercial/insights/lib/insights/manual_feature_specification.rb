module Insights
  module ManualFeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'manual_insights'
    end

    def self.feature_title
      'Manual reporting flow : from inputs to insights'
    end

    def self.feature_description # optional
      <<~DESC
        Manual reporting flow : from inputs to insights
      DESC
    end
  end
end
