require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:user_custom_fields_feature_name) { UserCustomFields::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(user_custom_fields_feature_name) 
  end
end