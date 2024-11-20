# frozen_string_literal: true

require 'rails_helper'

describe Onboarding::OnboardingService do
  let(:service) { described_class.new }

  before do
    @app_config = AppConfiguration.instance.tap do |cfg|
      cfg.settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: [
          { name: 'fake_sso' }
        ]
      }
      cfg.save!
    end
  end

  describe '#current_campaign' do
    context 'when the user is verified' do
      let(:verified_user) { create(:user, verified: true) }

      it { expect(service.current_campaign(verified_user)).not_to eq :verification }
    end

    context 'when the user is not verified' do
      let(:user_not_verified) { create(:user, verified: false) }

      it { expect(service.current_campaign(user_not_verified)).to eq(:verification) }

      it 'does not return :verification if the user dismissed :verification' do
        Onboarding::CampaignDismissal.create(user: user_not_verified, campaign_name: 'verification')
        expect(service.current_campaign(user_not_verified)).not_to eq :verification
      end

      context 'when verification is not active' do
        it 'does not return :verification' do
          SettingsService.new.deactivate_feature! 'verification'
          Onboarding::CampaignDismissal.create(user: user_not_verified, campaign_name: 'verification')
          expect(service.current_campaign(user_not_verified)).not_to eq :verification
        end
      end

      context 'when there are no verification methods' do
        it 'does not return :verification' do
          settings = AppConfiguration.instance.settings
          settings['verification']['verification_methods'] = []
          AppConfiguration.instance.update!(settings:)
          Onboarding::CampaignDismissal.create(user: user_not_verified, campaign_name: 'verification')
          expect(service.current_campaign(user_not_verified)).not_to eq :verification
        end
      end

      context 'when all verification methods have "hide_from_profile = true"' do
        it 'does not return :verification' do
          settings = AppConfiguration.instance.settings
          settings['verification']['verification_methods'] = [
            { name: 'fake_sso', hide_from_profile: true }
          ]
          AppConfiguration.instance.update!(settings:)
          Onboarding::CampaignDismissal.create(user: user_not_verified, campaign_name: 'verification')
          expect(service.current_campaign(user_not_verified)).not_to eq :verification
        end
      end
    end
  end
end
