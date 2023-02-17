# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:posthog_integration_feature_name) { PosthogIntegration::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(posthog_integration_feature_name)
  end
end
