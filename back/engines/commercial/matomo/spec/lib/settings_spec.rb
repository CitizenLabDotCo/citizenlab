require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:matomo_feature_name) { Matomo::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(matomo_feature_name)
  end
end
