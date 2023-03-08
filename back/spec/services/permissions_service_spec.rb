# frozen_string_literal: true

require 'rails_helper'

describe PermissionsService do
  let(:service) { described_class.new }

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
    let(:everyone_permission) { build(:permission, :by_everyone) }
    let(:users_permission) { build(:permission, :by_users) }
    let(:admins_mods_permission) { build(:permission, :by_admins_moderators) }

    context 'when not signed in' do
      let(:user) { nil }

      it { expect(service.denied_reason_for_permission(everyone_permission, user)).to be_nil }
      it { expect(service.denied_reason_for_permission(users_permission, user)).to eq('not_signed_in') }
      it { expect(service.denied_reason_for_permission(admins_mods_permission, user)).to eq('not_signed_in') }
    end

    context 'when user is admin' do
      let(:admin) { build(:admin) }

      it { expect(service.denied_reason_for_permission(everyone_permission, admin)).to be_nil }
      it { expect(service.denied_reason_for_permission(users_permission, admin)).to be_nil }
      it { expect(service.denied_reason_for_permission(admins_mods_permission, admin)).to be_nil }
    end

    context 'when signed in' do
      let(:user) { build(:user) }

      it { expect(service.denied_reason_for_permission(everyone_permission, user)).to be_nil }
      it { expect(service.denied_reason_for_permission(users_permission, user)).to be_nil }
      it { expect(service.denied_reason_for_permission(admins_mods_permission, user)).to eq 'not_permitted' }
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
        user.update!(email_confirmed_at: nil, password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
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
        user.update!(email_confirmed_at: nil)
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
        user.save!
        user.update!(email_confirmed_at: nil)
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
        user.save!
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
end
