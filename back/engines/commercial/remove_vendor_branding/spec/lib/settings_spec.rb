# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:feature_name) { RemoveVendorBranding::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(feature_name)
  end
end
