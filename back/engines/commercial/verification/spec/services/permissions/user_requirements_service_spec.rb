# frozen_string_literal: true

require 'rails_helper'

describe Permissions::UserRequirementsService do
  let(:service) { described_class.new }

  describe '#requirements' do
    context 'when permitted_by is set to a verification group' do
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
