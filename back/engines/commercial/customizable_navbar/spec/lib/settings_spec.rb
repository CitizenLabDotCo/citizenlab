require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:feature_name) { CustomizableNavbar::FeatureSpecification.feature_name }

  it 'is included in the json schema' do
    expect(described_class.json_schema['properties']).to include(feature_name)
  end
end
