# frozen_string_literal: true

require 'rails_helper'

describe Verification::VerificationService do
  let(:sfxv_service) { instance_double(Verification::SideFxVerificationService) }
  let(:service) { described_class.new sfxv_service }

  before do
    SettingsService.new.activate_feature!(
      'verification',
      settings: {
        verification_methods: [
          { name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' }
        ]
      }
    )
  end

  describe 'verify_sync' do
    let(:user) { create(:user) }

    it 'executes side fx hooks' do
      params = {
        user: user,
        method_name: 'bogus',
        verification_parameters: { desired_error: nil }
      }

      allow_any_instance_of(IdBogus::BogusVerification)
        .to receive(:verify_sync)
        .and_return({ uid: 'fakeuuid' })

      expect(sfxv_service)
        .to receive(:before_create)
        .with(instance_of(Verification::Verification), user)

      expect(sfxv_service)
        .to receive(:after_create)
        .with(instance_of(Verification::Verification), user)

      service.verify_sync(**params)
    end

    it 'updates the user with received attributes from verify_sync' do
      allow(sfxv_service).to receive(:before_create)
      allow(sfxv_service).to receive(:after_create)

      params = {
        user: user,
        method_name: 'bogus',
        verification_parameters: {}
      }

      allow_any_instance_of(IdBogus::BogusVerification)
        .to receive(:verify_sync)
        .and_return({
          uid: '123',
          attributes: { first_name: 'BOB' }
        })

      service.verify_sync(**params)

      expect(user.reload.first_name).to eq 'BOB'
    end

    it 'updates the user with received custom_field_values from verify_sync' do
      allow(sfxv_service).to receive(:before_create)
      allow(sfxv_service).to receive(:after_create)
      cf1 = create(:custom_field)
      cf2 = create(:custom_field)
      user.update!(custom_field_values: {
        cf1.key => 'original',
        cf2.key => 'original'
      })

      params = {
        user: user,
        method_name: 'bogus',
        verification_parameters: {}
      }

      allow_any_instance_of(IdBogus::BogusVerification)
        .to receive(:verify_sync)
        .and_return({
          uid: '123',
          custom_field_values: {
            cf2.key => 'changed'
          }
        })

      service.verify_sync(**params)

      expect(user.reload.custom_field_values).to eq({
        cf1.key => 'original',
        cf2.key => 'changed'
      })
    end

    it 'adds a verification' do
      allow(sfxv_service).to receive(:before_create)
      allow(sfxv_service).to receive(:after_create)

      params = {
        user: user,
        method_name: 'cow',
        verification_parameters: { run: '12.025.365-6', id_serial: 'A001529382' }
      }

      expect(Verification::Verification.count).to eq 0

      expect_any_instance_of(IdCow::CowVerification)
        .to receive(:verify_sync)
        .with(params[:verification_parameters])
        .and_return({ uid: '001529382' })

      service.verify_sync(**params)

      expect(Verification::Verification.count).to eq 1
      expect(Verification::Verification.first).to have_attributes({
        user_id: user.id,
        method_name: 'cow',
        hashed_uid: 'edf6e3b986a782f63f6c28f47d33f2cd327e12bc70c2e07779d60999cd811b50',
        active: true
      })
    end

    it 'raises a VerificationTakenError when another user verified with that identity' do
      allow(sfxv_service).to receive(:before_create)
      allow(sfxv_service).to receive(:after_create)

      params1 = {
        user: create(:user),
        method_name: 'cow',
        verification_parameters: { run: '12.025.365-6', id_serial: 'A001529382' }
      }

      expect_any_instance_of(IdCow::CowVerification)
        .to receive(:verify_sync)
        .with(params1[:verification_parameters])
        .and_return({ uid: '001529382' })

      service.verify_sync(**params1)

      params2 = {
        user: user,
        method_name: 'cow',
        verification_parameters: { run: '12.025.365-6', id_serial: 'A001529382' }
      }

      expect_any_instance_of(IdCow::CowVerification)
        .to receive(:verify_sync)
        .with(params2[:verification_parameters])
        .and_return({ uid: '001529382' })

      expect { service.verify_sync(**params2) }.to raise_error(Verification::VerificationService::VerificationTakenError)
    end
  end

  describe 'locked_attributes' do
    context 'for a user only authenticated with facebook' do
      it 'returns no locked attributes' do
        identity = create(:facebook_identity)
        expect(service.locked_attributes(identity.user)).to eq []
      end
    end

    context 'for a user only verified with bosa_fas' do
      it 'returns some locked attributes' do
        verification = create(:verification, method_name: 'bosa_fas')
        expect(service.locked_attributes(verification.user)).to match_array %i[first_name last_name]
      end
    end
  end

  describe 'locked_custom_fields' do
    context 'for a user only authenticated with facebook' do
      it 'returns no locked custom field keys' do
        identity = create(:facebook_identity)
        expect(service.locked_custom_fields(identity.user)).to eq []
      end
    end

    context 'for a user only verified with bogus' do
      it 'returns some locked custom field keys when the custom field exists' do
        create(:custom_field_gender)
        verification = create(:verification, method_name: 'bogus')
        expect(service.locked_custom_fields(verification.user)).to match_array [:gender]
      end

      it 'does not return locked custom field keys when the field does not exist' do
        verification = create(:verification, method_name: 'bogus')
        expect(service.locked_custom_fields(verification.user)).to be_empty
      end
    end
  end

  describe 'method_metadata' do
    it 'returns allowed_for_verified_actions: false if first method does not support verified actions' do
      vm = service.method_metadata(service.first_method_enabled)
      expect(vm[:allowed_for_verified_actions]).to be(false)
    end

    it 'returns information about the first enabled method enabled for actions' do
      create(:custom_field_gender)
      create(:custom_field_birthyear)

      configuration = AppConfiguration.instance
      configuration.settings['verification']['verification_methods'] << { name: 'fake_sso', enabled_for_verified_actions: true }
      configuration.save!

      metadata = service.method_metadata(service.first_method_enabled_for_verified_actions)
      expect(metadata[:name]).to eq 'Fake SSO'
      expect(metadata[:locked_attributes]).to match_array [
        { 'en' => 'First name(s)', 'fr-FR' => 'Prénom(s)', 'nl-NL' => 'Voornamen' },
        { 'en' => 'Last name', 'fr-FR' => 'Nom de famille', 'nl-NL' => 'Achternaam' }
      ]
      expect(metadata[:other_attributes]).to match_array [
        { 'en' => 'Email', 'fr-FR' => 'E-mail', 'nl-NL' => 'E-mail' }
      ]
      expect(metadata[:locked_custom_fields]).to match_array [
        { 'en' => 'gender' }, { 'en' => 'birthyear' }
      ]
      expect(metadata[:other_custom_fields]).to be_empty
    end
  end
end
