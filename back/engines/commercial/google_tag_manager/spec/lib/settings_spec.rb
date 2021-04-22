require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:google_tag_manager_feature_name) { GoogleTagManager::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(google_tag_manager_feature_name)
  end
end
