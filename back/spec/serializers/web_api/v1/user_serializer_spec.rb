# frozen_string_literal: true

require 'rails_helper'

describe WebApi::V1::UserSerializer do
  describe 'early_access_features' do
    let(:admin) { create(:admin, early_access_features: ['spaces']) }

    before do
      allow(AppConfiguration::Settings).to receive(:early_access_features).and_return({ 'spaces' => 'general' })
    end

    def attributes_for(current_user)
      described_class.new(admin, params: { current_user: current_user }).serializable_hash.dig(:data, :attributes)
    end

    it 'is serialized for the user themselves' do
      expect(attributes_for(admin)).to include(early_access_features: admin.early_access_features)
    end

    it 'reports which features the user is offered' do
      expect(attributes_for(admin)).to include(offered_early_access_features: { 'spaces' => 'general' })
    end

    it 'is not serialized for a resident' do
      expect(attributes_for(create(:user))).not_to have_key(:early_access_features)
    end

    it 'is not serialized for another admin' do
      attributes = attributes_for(create(:admin))

      expect(attributes).not_to have_key(:early_access_features)
      expect(attributes).not_to have_key(:offered_early_access_features)
    end
  end

  context "with 'abbreviated user names' enabled" do
    before { SettingsService.new.activate_feature! 'abbreviated_user_names' }

    let(:jane) { create(:user, first_name: 'Jane', last_name: 'Doe') }
    let(:john) { create(:user, first_name: 'John', last_name: 'Smith') }
    let(:admin) { create(:admin, first_name: 'Thomas', last_name: 'Anderson') }

    it 'abbreviates the user name' do
      last_name = described_class
        .new(jane, params: { current_user: john })
        .serializable_hash
        .dig(:data, :attributes, :last_name)
      expect(last_name).to eq 'D.'
    end

    it 'does not abbreviate user names for admins' do
      last_name = described_class
        .new(jane, params: { current_user: admin })
        .serializable_hash
        .dig(:data, :attributes, :last_name)
      expect(last_name).to eq 'Doe'

      last_name = described_class
        .new(admin, params: { current_user: jane })
        .serializable_hash
        .dig(:data, :attributes, :last_name)
      expect(last_name).to eq 'Anderson'
    end
  end
end
