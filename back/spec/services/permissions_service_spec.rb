# frozen_string_literal: true

require 'rails_helper'

describe PermissionsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe '#denied_reason_for_resource' do
    let(:action) { 'posting_initiative' }
    let(:permission) { Permission.find_by(permission_scope: nil, action: action) }
    let(:user) { create(:user) }

    before { service.update_global_permissions }

    it 'returns nil when action is allowed' do
      groups = create_list(:group, 2)
      groups.first.add_member(user).save!
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      expect(service.denied_reason_for_resource(user, action)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_resource(nil, action)).to eq 'not_signed_in'
    end

    it 'returns `not_permitted` when user is not in authorized groups' do
      permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2).map(&:id))
      expect(service.denied_reason_for_resource(user, action)).to eq 'not_permitted'
    end
  end

  describe '#denied_reason_for_permission' do
    before do
      create :custom_field_birthyear, required: true
      create :custom_field_gender, required: false
      create :custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_required_field'
      create :custom_field_number, resource_type: 'User', required: false, key: 'extra_optional_field'
    end

    let(:user) do
      create(
        :user,
        first_name: 'Jerry',
        last_name: 'Jones',
        email: 'jerry@jones.com',
        custom_field_values: {
          'gender' => 'male',
          'birthyear' => 1982,
          'extra_required_field' => false,
          'extra_optional_field' => 29
        },
        registration_completed_at: Time.now,
        password: 'supersecret',
        email_confirmed_at: Time.now
      )
    end

    let(:permission) { create :permission, permitted_by: permitted_by }
    let(:denied_reason) { service.denied_reason_for_permission permission, user }

    context 'when permitted by everyone' do
      let(:permitted_by) { 'everyone' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to be_nil }
      end
    end

    context 'when permitted by light users' do
      let(:permitted_by) { 'everyone_confirmed_email' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end

    context 'when permitted by full residents' do
      let(:permitted_by) { 'users' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed inactive resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered sso user' do
        before do
          facebook_identity = create(:facebook_identity)
          user.identities << facebook_identity
          user.update!(password_digest: nil)
          user.save!
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end

    context 'when permitted by groups' do
      let(:groups) { create_list :group, 2 }
      let(:permission) { create :permission, permitted_by: 'groups', groups: groups }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light unconfirmed resident who is group member' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, manual_groups: [groups.last])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed resident who is not a group member' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'not_permitted' }
      end

      context 'when fully registered resident who is not a group member' do
        it { expect(denied_reason).to eq 'not_permitted' }
      end

      context 'when admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end

    context 'when permitted by moderators' do
      let(:permitted_by) { 'admins_moderators' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'not_permitted' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end
  end

  describe '#requirements' do
    before do
      create :custom_field_birthyear, required: true
      create :custom_field_gender, required: false
      create :custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_required_field'
      create :custom_field_number, resource_type: 'User', required: false, key: 'extra_optional_field'
    end

    let(:user) do
      create(
        :user,
        first_name: 'Jane',
        last_name: 'Jacobs',
        email: 'jane@jacobs.com',
        custom_field_values: {
          'gender' => 'female',
          'birthyear' => 1975,
          'extra_required_field' => false,
          'extra_optional_field' => 29
        },
        password: 'supersecret',
        email_confirmed_at: Time.now
      )
    end

    context 'when permitted_by is set to everyone_confirmed_email' do
      let(:permission) { create :permission, permitted_by: 'everyone_confirmed_email' }

      it 'does not permit a visitor' do
        expect(service.requirements(permission, nil)).to eq({
          permitted: false,
          requirements: {
            built_in: {
              first_name: 'dont_ask',
              last_name: 'dont_ask',
              email: 'require'
            },
            custom_fields: {
              'birthyear' => 'dont_ask',
              'gender' => 'dont_ask',
              'extra_required_field' => 'dont_ask',
              'extra_optional_field' => 'dont_ask'
            },
            special: {
              password: 'dont_ask',
              confirmation: 'require'
            }
          }
        })
      end

      it 'does not permit a light unconfirmed resident' do
        user.reset_confirmation_and_counts
        user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        expect(service.requirements(permission, user)).to eq({
          permitted: false,
          requirements: {
            built_in: {
              first_name: 'dont_ask',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {
              'birthyear' => 'dont_ask',
              'gender' => 'dont_ask',
              'extra_required_field' => 'dont_ask',
              'extra_optional_field' => 'dont_ask'
            },
            special: {
              password: 'dont_ask',
              confirmation: 'require'
            }
          }
        })
      end

      it 'permits a light confirmed resident' do
        user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        expect(service.requirements(permission, user)).to eq({
          permitted: true,
          requirements: {
            built_in: {
              first_name: 'dont_ask',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {
              'birthyear' => 'dont_ask',
              'gender' => 'dont_ask',
              'extra_required_field' => 'dont_ask',
              'extra_optional_field' => 'dont_ask'
            },
            special: {
              password: 'dont_ask',
              confirmation: 'satisfied'
            }
          }
        })
      end

      it 'does not permit a fully registered unconfirmed resident' do # https://citizenlabco.slack.com/archives/C04FX2ATE5B/p1677170928400679
        user.reset_confirmation_and_counts
        expect(service.requirements(permission, user)).to eq({
          permitted: false,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {
              'birthyear' => 'satisfied',
              'gender' => 'satisfied',
              'extra_required_field' => 'satisfied',
              'extra_optional_field' => 'satisfied'
            },
            special: {
              password: 'satisfied',
              confirmation: 'require'
            }
          }
        })
      end

      it 'permits a fully registered confirmed resident' do
        expect(service.requirements(permission, user)).to eq({
          permitted: true,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {
              'birthyear' => 'satisfied',
              'gender' => 'satisfied',
              'extra_required_field' => 'satisfied',
              'extra_optional_field' => 'satisfied'
            },
            special: {
              password: 'satisfied',
              confirmation: 'satisfied'
            }
          }
        })
      end

      it 'does not permit an unconfirmed admin' do
        user.add_role 'admin'
        user.reset_confirmation_and_counts
        expect(service.requirements(permission, user)).to eq({
          permitted: false,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {
              'birthyear' => 'satisfied',
              'gender' => 'satisfied',
              'extra_required_field' => 'satisfied',
              'extra_optional_field' => 'satisfied'
            },
            special: {
              password: 'satisfied',
              confirmation: 'require'
            }
          }
        })
      end

      it 'permits a confirmed admin' do
        user.add_role 'admin'
        expect(service.requirements(permission, user)).to eq({
          permitted: true,
          requirements: {
            built_in: {
              first_name: 'satisfied',
              last_name: 'satisfied',
              email: 'satisfied'
            },
            custom_fields: {
              'birthyear' => 'satisfied',
              'gender' => 'satisfied',
              'extra_required_field' => 'satisfied',
              'extra_optional_field' => 'satisfied'
            },
            special: {
              password: 'satisfied',
              confirmation: 'satisfied'
            }
          }
        })
      end
    end
  end

  describe '#schema_fields' do
    let(:custom_fields) { [true, false].map { |required| create :custom_field, required: required } }
    let(:permission) do
      create(:permission, action: action, permission_scope: permission_scope).tap do |permission|
        custom_fields.each do |field|
          create :permissions_custom_field, permission: permission, custom_field: field, required: !field.required
        end
        permission.reload
      end
    end
    let(:schema_fields) { service.schema_fields permission }

    context 'when visiting action in global scope' do
      let(:permission_scope) { nil }
      let(:action) { 'visiting' }

      it 'returns the original required values' do
        expect(schema_fields.map(&:id)).to eq custom_fields.map(&:id)
        expect(schema_fields.map(&:required)).to eq [true, false]
      end
    end

    context 'when voting_idea action in a project' do
      let(:permission_scope) { create :continuous_project }
      let(:action) { 'voting_idea' }

      it 'returns the required values associated to the permission' do
        expect(schema_fields.map(&:id)).to eq custom_fields.map(&:id)
        expect(schema_fields.map(&:required)).to eq [false, true]
      end
    end

    context 'when posting_initiative action in a project' do
      let(:permission_scope) { nil }
      let(:action) { 'posting_initiative' }

      it 'returns the required values associated to the permission' do
        expect(schema_fields.map(&:id)).to eq custom_fields.map(&:id)
        expect(schema_fields.map(&:required)).to eq [false, true]
      end
    end
  end
end
