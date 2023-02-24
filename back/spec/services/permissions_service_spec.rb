# frozen_string_literal: true

require 'rails_helper'

describe PermissionsService do
  let(:service) { described_class.new }

  describe '#denied_reason' do
    let(:action) { 'posting_initiative' }
    let(:permission) { Permission.find_by(permission_scope: nil, action: action) }
    let(:user) { create(:user) }

    before { service.update_global_permissions }

    it 'returns nil when action is allowed' do
      groups = create_list(:group, 2)
      groups.first.add_member(user).save!
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      expect(service.denied_reason(user, action)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason(nil, action)).to eq 'not_signed_in'
    end

    it 'returns `not_permitted` when user is not in authorized groups' do
      permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2).map(&:id))
      expect(service.denied_reason(user, action)).to eq 'not_permitted'
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

      # no user
      # light user not permitted
      # light user permitted
      # registered user no confirmation
      it 'does not permit a registered unconfirmed user' do
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
      # registered user permitted
      # admin
    end

    # TODO: everyone, users, groups and admins
  end
end
