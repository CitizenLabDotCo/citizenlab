# frozen_string_literal: true

require 'rails_helper'

describe Permissions::UserRequirementsService do
  let(:service) { described_class.new }

  describe '#requirements' do
    context 'when permitted_by is set "groups" and permission has a verification group' do
      let(:groups) { [create(:group), create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])] }
      let(:group_permission) { create(:permission, permitted_by: 'groups', groups: groups) }

      context 'there is no user' do
        it 'requires verification' do
          requirements = service.requirements(group_permission, nil)
          expect(requirements[:requirements][:special][:verification]).to eq('require')
          expect(requirements[:permitted]).to be false
        end
      end

      context 'a user is not verified' do
        let(:user) { create(:user, verified: false) }

        it 'requires verification' do
          requirements = service.requirements(group_permission, user)
          expect(requirements[:requirements][:special][:verification]).to eq('require')
          expect(requirements[:permitted]).to be false
        end
      end

      context 'a user is verified' do
        let(:user) { create(:user, verified: true) }

        it 'verification is satisfied' do
          requirements = service.requirements(group_permission, user)
          expect(requirements[:requirements][:special][:verification]).to eq('satisfied')
          expect(requirements[:permitted]).to be true
        end
      end
    end

    context 'when permitted_by is set "custom" and permission_field is enabled' do
      let(:custom_permission) { create(:permission, permitted_by: 'custom') }

      before do
        SettingsService.new.activate_feature! 'verified_actions'

        # TODO: JS - Can we add this into a factory or something?
        configuration = AppConfiguration.instance
        settings = configuration.settings
        settings['verification'] = {
          allowed: true,
          enabled: true,
          verification_methods: [
            { name: 'cow', api_username: 'fake_username', api_password: 'fake_password', rut_empresa: 'fake_rut_empresa' },
            { name: 'id_card_lookup', method_name_multiloc: { en: 'By social security number' }, card_id_multiloc: { en: 'Social security number' }, card_id_placeholder: 'xx-xxxxx-xx', card_id_tooltip_multiloc: { en: 'You can find this number on you card. We just check, we don\'t store it' }, explainer_image_url: 'https://some.fake/image.png' }
          ]
        }
        configuration.save!

        # Should probably add this to the 'custom_permission' factory
        Permissions::PermissionsFieldsService.new.persist_default_fields(permission: custom_permission, previous_permitted_by: 'users')
        custom_permission.permissions_fields.find_by(field_type: 'verification').update!(enabled: true, required: true)
      end

      context 'there is no user' do
        it 'requires verification' do
          requirements = service.requirements(custom_permission, nil)
          expect(requirements[:requirements][:special][:verification]).to eq('require')
          expect(requirements[:permitted]).to be false
        end
      end

      context 'a user is not verified' do
        let(:user) { create(:user, verified: false) }

        it 'requires verification' do
          requirements = service.requirements(custom_permission, user)
          expect(requirements[:requirements][:special][:verification]).to eq('require')
          expect(requirements[:permitted]).to be false
        end
      end

      context 'a user is verified' do
        let(:user) { create(:user, verified: true) }

        it 'verification is satisfied' do
          requirements = service.requirements(custom_permission, user)
          expect(requirements[:requirements][:special][:verification]).to eq('satisfied')
          expect(requirements[:permitted]).to be true
        end
      end
    end

    context 'when permitted_by group is NOT set to a verification group' do
      let(:groups) { [create(:group), create(:smart_group)] }
      let(:group_permission) { create(:permission, permitted_by: 'groups', groups: groups) }

      it 'verification is not required' do
        requirements = service.requirements(group_permission, nil)
        expect(requirements[:requirements][:special][:verification]).to eq('dont_ask')
      end
    end

    context 'when permitted_by is NOT set to groups' do
      let(:permission) { create(:permission, permitted_by: 'users') }

      it 'verification is not required' do
        requirements = service.requirements(permission, nil)
        expect(requirements[:requirements][:special][:verification]).to eq('dont_ask')
      end
    end
  end
end
