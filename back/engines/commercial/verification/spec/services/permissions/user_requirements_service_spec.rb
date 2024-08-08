# frozen_string_literal: true

require 'rails_helper'

describe Permissions::UserRequirementsService do
  let(:service) { described_class.new }

  describe '#requirements' do
    context 'when permitted_by is set "groups" and permission has a verification group' do
      let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
      let(:group_permission) { create(:permission, permitted_by: 'users', groups: groups) }

      context 'there is no user' do
        it 'requires verification' do
          requirements = service.requirements(group_permission, nil)
          expect(service.permitted?(requirements)).to be false
          expect(requirements[:authentication][:permitted_by]).to eq 'users'
          expect(requirements[:verification]).to be true
        end
      end

      context 'a user is not verified' do
        let(:user) { create(:user, verified: false) }

        it 'requires verification' do
          requirements = service.requirements(group_permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements[:authentication][:permitted_by]).to eq 'users'
          expect(requirements[:verification]).to be true
        end
      end

      context 'a user is verified' do
        let(:user) { create(:user, verified: true) }

        it 'verification is satisfied' do
          requirements = service.requirements(group_permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements[:authentication][:permitted_by]).to eq 'users'
          expect(requirements[:verification]).to be false
        end
      end
    end

    context 'when permitted_by is set to "verified" and permissions_custom_field is enabled' do
      let(:verified_permission) { create(:permission, permitted_by: 'verified') }

      before do
        configuration = AppConfiguration.instance
        settings = configuration.settings
        settings['verification'] = {
          allowed: true,
          enabled: true,
          verification_methods: [
            { name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' },
            { name: 'id_card_lookup', method_name_multiloc: { en: 'By social security number' }, card_id_multiloc: { en: 'Social security number' }, card_id_placeholder: 'xx-xxxxx-xx', card_id_tooltip_multiloc: { en: 'You can find this number on you card. We just check, we don\'t store it' }, explainer_image_url: 'https://some.fake/image.png' },
            { name: 'fake_sso' } # This is the only one currently enabled for verified 'permitted_by'
          ]
        }
        configuration.save!
      end

      context 'there is no user' do
        it 'requires verification' do
          requirements = service.requirements(verified_permission, nil)
          expect(service.permitted?(requirements)).to be false
          expect(requirements[:authentication][:permitted_by]).to eq 'verified'
          expect(requirements[:verification]).to be true
        end
      end

      context 'a user is not verified' do
        let(:user) { create(:user, verified: false) }

        it 'requires verification' do
          requirements = service.requirements(verified_permission, user)
          expect(service.permitted?(requirements)).to be false
          expect(requirements[:authentication][:permitted_by]).to eq 'verified'
          expect(requirements[:verification]).to be true
        end
      end

      context 'a user is verified' do
        let(:user) { create(:user, verified: true) }

        it 'verification is satisfied' do
          requirements = service.requirements(verified_permission, user)
          expect(service.permitted?(requirements)).to be true
          expect(requirements[:authentication][:permitted_by]).to eq 'verified'
          expect(requirements[:verification]).to be false
        end
      end
    end

    context 'when permitted_by group is NOT set to a verification group' do
      let(:groups) { [create(:group), create(:smart_group)] }
      let(:group_permission) { create(:permission, permitted_by: 'users', groups: groups) }

      it 'verification is not required' do
        requirements = service.requirements(group_permission, nil)
        expect(requirements[:authentication][:permitted_by]).to eq 'users'
        expect(requirements[:verification]).to be false
      end
    end

    context 'when permitted_by is NOT set to groups' do
      let(:permission) { create(:permission, permitted_by: 'users') }

      it 'verification is not required' do
        requirements = service.requirements(permission, nil)
        expect(requirements[:authentication][:permitted_by]).to eq 'users'
        expect(requirements[:verification]).to be false
      end
    end

    context 'when permitted_by is set to "verified"' do
      let(:permission) { create(:permission, permitted_by: 'verified') }

      it 'does not remove missing authentication requirements if not verified' do
        user = create(:user, unique_code: '1234abcd', email: nil, password: nil)
        requirements = service.requirements(permission, user)
        expect(requirements[:authentication][:missing_user_attributes]).to eq %i[email password]
      end

      it 'removes all missing authentication requirements if verified' do
        user = create(:user, unique_code: '1234abcd', email: nil, password: nil, verified: true)
        requirements = service.requirements(permission, user)
        expect(requirements[:authentication][:missing_user_attributes]).to be_empty
      end
    end
  end
end
