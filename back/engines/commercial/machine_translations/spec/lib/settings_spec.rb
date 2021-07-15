require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:machine_translations_feature_name) { MachineTranslations::FeatureSpecification.feature_name }

  it do
    expect(described_class.json_schema['properties']).to include(machine_translations_feature_name) 
  end
end
