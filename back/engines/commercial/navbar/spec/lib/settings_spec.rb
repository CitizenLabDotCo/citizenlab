require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:navbar_feature_name) { Navbar::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(navbar_feature_name)
  end
end
