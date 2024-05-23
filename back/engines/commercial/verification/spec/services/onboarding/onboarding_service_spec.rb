# frozen_string_literal: true

require 'rails_helper'

describe Onboarding::OnboardingService do
  let(:service) { described_class.new }

  before do
    @app_config = AppConfiguration.instance.tap do |cfg|
      cfg.settings['verification'] = {
        allowed: true,
        enabled: true,
        verification_methods: []
      }
      cfg.save!
    end
  end

  describe '#current_campaign' do
    context 'when the user is not verified' do
      let(:user_not_verified) do
        create(
          :user,
          bio_multiloc: { en: "I'm a great bloke" },
          verified: false
        )
      end

      it { expect(service.current_campaign(user_not_verified)).to eq(:verification) }

      it 'does not return :verification if the user dismissed :verification' do
        Onboarding::CampaignDismissal.create(user: user_not_verified, campaign_name: 'verification')
        expect(service.current_campaign(user_not_verified)).not_to eq :verification
      end

      context 'when verification is not active' do
        before do
          SettingsService.new.deactivate_feature! 'verification'
        end

        it 'does not return :verification' do
          Onboarding::CampaignDismissal.create(user: user_not_verified, campaign_name: 'verification')
          expect(service.current_campaign(user_not_verified)).not_to eq :verification
        end
      end
    end
  end
end
