require 'rails_helper'

RSpec.describe AppConfiguration::Settings do
  let(:flagging_feature_name) { FlagInappropriateContent::FeatureSpecification.feature_name }

  it 'is included in the json schema' do
    expect(described_class.json_schema['properties']).to include(flagging_feature_name) 
  end

  it 'requires the moderation feature' do
    tenant = build(:tenant)
    tenant.settings['moderation'] = {'allowed' => true, 'enabled' => false}
    tenant.settings['flag_inappropriate_content'] = {'allowed' => true, 'enabled' => true}
    expect(tenant).to be_invalid

    tenant.settings['moderation'] = {'allowed' => true, 'enabled' => true}
    expect(tenant).to be_valid
  end
end
