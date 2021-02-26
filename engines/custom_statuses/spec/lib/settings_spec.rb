require 'rails_helper'

RSpec.describe CustomStatuses::Settings do
  let(:custom_statuses_feature_name) { CustomStatuses::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to 
      include(custom_statuses_feature_name) 
  end
end