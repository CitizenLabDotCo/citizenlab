# frozen_string_literal: true

require 'rails_helper'

describe AdminPublicationPolicy do
  subject { described_class.new(user, admin_publication) }

  let(:scope) { AdminPublicationPolicy::Scope.new(user, AdminPublication) }

  context "for a user on a private groups project where she's no member of a rules group with access" do
    let!(:user) { create(:user, email: 'not-user@test.com') }
    let!(:group) do
      create(
        :smart_group,
        rules: [
          { ruleType: 'email', predicate: 'is', value: 'user@test.com' }
        ]
      )
    end
    let!(:admin_publication) { create(:project, visible_to: 'groups', groups: [group]).admin_publication }

    it { is_expected.not_to permit(:reorder) }

    it 'does not index the project holder' do
      expect(scope.resolve.size).to eq 0
    end
  end
end
