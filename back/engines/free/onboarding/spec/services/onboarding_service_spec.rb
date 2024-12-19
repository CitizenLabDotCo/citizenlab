# frozen_string_literal: true

require 'rails_helper'

describe Onboarding::OnboardingService do
  let(:service) { described_class.new }

  describe 'current_campaign' do
    let(:custom_field) { create(:custom_field) }
    let(:user) do
      create(
        :user,
        bio_multiloc: { en: "I'm a great bloke" },
        custom_field_values: { custom_field.key => 'Quite often' }
      )
    end

    it 'raises an error when no user is passed' do
      expect { service.current_campaign(nil) }.to raise_error ArgumentError
    end

    it 'returns :complete_profile when the user has an empty bio' do
      user.update!(bio_multiloc: {})
      expect(service.current_campaign(user)).to eq :complete_profile
    end

    it 'returns :complete_profile when the user has empty signup fields' do
      user.update!(custom_field_values: {})
      expect(service.current_campaign(user)).to eq :complete_profile
    end

    it 'returns :complete_profile when the user has no avatar configured' do
      user.remove_avatar!
      expect(service.current_campaign(user)).to eq :complete_profile
    end

    it 'returns :default when a user with an incomplete profile dismissed :complete_profile' do
      user.update!(bio_multiloc: {})
      Onboarding::CampaignDismissal.create(user: user, campaign_name: 'complete_profile')
      expect(service.current_campaign(user)).to eq :default
    end

    context 'when a custom message is configured' do
      before do
        AppConfiguration.instance.tap do |cfg|
          cfg.settings['core']['custom_onboarding_message'] = { en: 'Do the hippy shake' }
        end.save!
      end

      it 'returns :custom_cta when a custom message is configured' do
        expect(service.current_campaign(user)).to eq :custom_cta
      end

      it 'returns :default when a custom message is configured and a user dismissed :custom_cta' do
        Onboarding::CampaignDismissal.create(user: user, campaign_name: 'custom_cta')
        expect(service.current_campaign(user)).to eq :default
      end
    end

    it 'returns :default when no custom message is configured' do
      expect(service.current_campaign(user)).to eq :default
    end

    context 'verification' do
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
end
