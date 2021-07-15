require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:flagging_feature_name) { FlagInappropriateContent::FeatureSpecification.feature_name }

  it 'is included in the json schema' do
    expect(described_class.json_schema['properties']).to include(flagging_feature_name) 
  end

  it 'requires the moderation feature' do
    config = AppConfiguration.instance
    config.settings['moderation'] = {'allowed' => true, 'enabled' => false}
    config.settings['flag_inappropriate_content'] = {'allowed' => true, 'enabled' => true}
    expect(config).to be_invalid

    config.settings['moderation'] = {'allowed' => true, 'enabled' => true}
    expect(config).to be_valid
  end
end
