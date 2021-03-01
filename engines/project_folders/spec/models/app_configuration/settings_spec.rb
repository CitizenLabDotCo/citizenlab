# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:folder_feature_name) { ProjectFolders::FeatureSpecification.feature_name }

  it { expect(described_class.json_schema['properties']).to include(folder_feature_name) }
end
