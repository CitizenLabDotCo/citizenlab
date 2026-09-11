# frozen_string_literal: true

require 'rails_helper'

describe Verification::VerificationService do
  let(:service) { described_class.new }

  before do
    AppConfiguration.instance.settings['id_config'] = {
      'allowed' => true,
      'enabled' => true,
      'id_methods' => [
        { name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' }
      ]
    }

    AppConfiguration.instance.save!
  end

  describe 'verify_sync' do
    let(:user) { create(:user) }

    it 'executes side fx hooks' do
      params = {
        user: user,
        method_name: 'bogus',
        verification_parameters: { desired_error: nil }
      }

      allow_any_instance_of(CustomIdMethods::Bogus::BogusVerification)
        .to receive(:verify_sync)
        .and_return({ uid: 'fakeuuid' })

      expect { service.verify_sync(**params) }
        .to have_enqueued_job(LogActivityJob)
        .with(an_instance_of(Verification::Verification), 'created', user, anything, payload: { method: 'bogus' })

      expect(user.reload.verified).to be true
    end

    it 'updates the user with received attributes from verify_sync' do
      params = {
        user: user,
        method_name: 'bogus',
        verification_parameters: {}
      }

      allow_any_instance_of(CustomIdMethods::Bogus::BogusVerification)
        .to receive(:verify_sync)
        .and_return({
          uid: '123',
          attributes: { first_name: 'BOB' }
        })

      service.verify_sync(**params)

      expect(user.reload.first_name).to eq 'BOB'
    end

    it 'updates the user with received custom_field_values from verify_sync' do
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

      allow_any_instance_of(CustomIdMethods::Bogus::BogusVerification)
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
      params = {
        user: user,
        method_name: 'cow',
        verification_parameters: { run: '12.025.365-6', id_serial: 'A001529382' }
      }

      expect(Verification::Verification.count).to eq 0

      expect_any_instance_of(CustomIdMethods::Cow::CowVerification)
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
      params1 = {
        user: create(:user),
        method_name: 'cow',
        verification_parameters: { run: '12.025.365-6', id_serial: 'A001529382' }
      }

      expect_any_instance_of(CustomIdMethods::Cow::CowVerification)
        .to receive(:verify_sync)
        .with(params1[:verification_parameters])
        .and_return({ uid: '001529382' })

      service.verify_sync(**params1)

      params2 = {
        user: user,
        method_name: 'cow',
        verification_parameters: { run: '12.025.365-6', id_serial: 'A001529382' }
      }

      expect_any_instance_of(CustomIdMethods::Cow::CowVerification)
        .to receive(:verify_sync)
        .with(params2[:verification_parameters])
        .and_return({ uid: '001529382' })

      expect { service.verify_sync(**params2) }.to raise_error(Verification::VerificationService::VerificationTakenError)
    end

    # The email-less shell an SSO method leaves behind. Arriving again with an email
    # used to delete it, nullifying its ideas and destroying its follows; it is
    # absorbed now, so nothing it contributed is lost.
    context 'when a blank SSO account already holds the identity' do
      let(:shell) do
        create(:user, registration_completed_at: Time.zone.now).tap do |u|
          u.update_columns(email: nil, password_digest: nil)
          create(:identity, user: u, provider: 'clave_unica', uid: '11111')
        end
      end

      # An omniauth method: only those assert their own uid, and only those absorb.
      def verify!(as:)
        service.verify_omniauth(
          user: as,
          auth: OmniAuth::AuthHash.new(provider: 'fake_sso', uid: 'shared-uid')
        )
      end

      it 'absorbs the shell rather than deleting it, keeping its participation' do
        verify!(as: shell)
        idea = create(:idea, author: shell)
        follow = create(:follower, user: shell)

        verify!(as: user)

        expect { shell.reload }.to raise_error ActiveRecord::RecordNotFound
        expect(idea.reload.author_id).to eq user.id
        expect(follow.reload.user_id).to eq user.id
      end

      it 'leaves the survivor with a single verification for the shared uid' do
        verify!(as: shell)

        verify!(as: user)

        expect(Verification::Verification.where(user_id: user.id).count).to eq 1
        expect(user.reload.verified).to be true
      end

      # A manual_sync uid is typed by the user, so absorbing on it would let anyone
      # knowing somebody's number take their account.
      it 'refuses instead of absorbing when the uid was typed rather than asserted' do
        allow_any_instance_of(CustomIdMethods::Bogus::BogusVerification)
          .to receive(:verify_sync).and_return({ uid: 'typed-uid' })
        typed = lambda do |as|
          service.verify_sync(user: as, method_name: 'bogus', verification_parameters: { desired_error: nil })
        end

        typed.call(shell)

        expect { typed.call(user) }.to raise_error described_class::VerificationTakenError
        expect(shell.reload).to be_present
      end
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
        expect(service.locked_custom_fields(verification.user)).to contain_exactly(:gender)
      end

      it 'does not return locked custom field keys when the field does not exist' do
        verification = create(:verification, method_name: 'bogus')
        expect(service.locked_custom_fields(verification.user)).to be_empty
      end
    end
  end
end
