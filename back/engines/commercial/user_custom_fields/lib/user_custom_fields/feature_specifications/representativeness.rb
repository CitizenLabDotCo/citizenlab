# frozen_string_literal: true

module UserCustomFields
  module FeatureSpecifications
    module Representativeness
      extend CitizenLab::Mixins::FeatureSpecification

      class << self
        def feature_name
          'representativeness'
        end

        def feature_title
          'Representativeness monitoring'
        end

        def feature_description
          'Adds a new dashboard to monitor the representativeness of the user base and project participants.'
        end

        def dependencies
          ['user_custom_fields']
        end

        def allowed_by_default
          false
        end

        def enabled_by_default
          false
        end
      end
    end
  end
end
