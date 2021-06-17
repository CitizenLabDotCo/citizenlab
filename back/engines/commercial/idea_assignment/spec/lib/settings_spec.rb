require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:flagging_feature_name) { IdeaAssignment::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(flagging_feature_name) 
  end
end
