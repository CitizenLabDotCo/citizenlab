# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Permission do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:permission)).to be_valid
    end
  end

  describe '#for_user' do
    let!(:permissions) do
      [
        create(:global_permission, :by_everyone, action: 'posting_initiative'),
        create(:global_permission, :by_users, action: 'voting_initiative'),
        create(:global_permission, :by_admins_moderators, action: 'commenting_initiative'),
        create(:permission, permitted_by: 'groups', groups: [manual_grp])
      ]
    end
    let(:manual_grp) { create(:group) }

    context 'when user is admin' do
      let(:admin) { build(:admin) }

      it { expect(described_class.for_user(admin)).to match_array permissions }
    end

    context 'when not logged in' do
      it { expect(described_class.for_user(nil)).to match_array [permissions[0]] }
    end

    context 'when user is logged in' do
      let(:user) { create(:user) }

      it { expect(described_class.for_user(user)).to match_array permissions[0..1] }
    end

    context 'when user belongs to the authorized manual group' do
      let(:user) { create(:user) }

      before { manual_grp.add_member(user).save! }

      it {
        expect(described_class.for_user(user)).to match_array [permissions[0], permissions[1], permissions[3]]
      }
    end
  end
end
