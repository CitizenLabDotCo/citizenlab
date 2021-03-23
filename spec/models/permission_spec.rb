require 'rails_helper'

RSpec.describe Permission, type: :model do

  describe 'for_user' do
    before do
      @p1 = create(:project_with_current_phase, phases_config: {sequence: "xcx"}, with_permissions: true)
      @past_phase, @current_phase, @future_phase = @p1.phases.sort_by(&:end_at)
      @p2 = create(:continuous_project, with_permissions: true)
      Permission.all.each{|pm| pm.update!(permitted_by: 'admins_moderators')}
      @permission_everyone = @current_phase.permissions.find_by action: 'posting_idea'
      @permission_everyone.update!(permitted_by: 'everyone')
      @g1 = create(:group)
      @g2 = create(:group)
      @permission_groups1 = @current_phase.permissions.find_by action: 'commenting_idea'
      @permission_groups1.update!(permitted_by: 'groups', groups: [@g1])
      @permission_groups2 = @current_phase.permissions.find_by action: 'voting_idea'
      @permission_groups2.update!(permitted_by: 'groups', groups: [@g2])
      create(:custom_field_number, title_multiloc: {'en' => 'Birthyear?'}, key: 'birthyear', code: 'birthyear')
    end

    it 'returns all permissions for admins' do
      expect(Permission.for_user(create(:admin)).count).to eq Permission.count
    end

    context 'when user is logged in' do
      let(:user) { create(:user) }

      it { expect(described_class.for_user(user)).to match permissions[0..1] }
    end

    context 'when user belongs to the authorized manual group' do
      let(:user) { create(:user) }
      before { manual_grp.add_member(user).save! }

      it {
        expect(described_class.for_user(user)).to match [permissions[0], permissions[1], permissions[3]]
      }
    end

    context 'when user belongs to the authorized smart group' do
      let(:user) { create(:user, email: 'info@citizenlab.co', birthyear: 1980) }

      it {
        expect(described_class.for_user(user)).to match [permissions[0], permissions[1], permissions[4]]
      }
    end
  end

  describe '#denied?' do
    let(:everyone_permission) { build(:permission, :by_everyone) }
    let(:users_permission) { build(:permission, :by_users) }
    let(:admins_mods_permission) { build(:permission, :by_admins_moderators) }

    context 'when not signed in' do
      let(:user) { nil }

      it { expect(everyone_permission).not_to be_denied(user) }
      it { expect(users_permission.denied?(user)).to eq('not_signed_in') }
      it { expect(admins_mods_permission.denied?(user)).to eq('not_permitted') }
    end

    context 'when user is admin' do
      let(:admin) { build(:admin) }

      it { expect(everyone_permission).not_to be_denied(admin) }
      it { expect(users_permission).not_to be_denied(admin) }
      it { expect(admins_mods_permission).not_to be_denied(admin) }
    end

    context 'when signed in' do
      let(:user) { build(:user) }

      it { expect(everyone_permission).not_to be_denied(user) }
      it { expect(users_permission).not_to be_denied(user) }
      it { expect(admins_mods_permission).to be_denied(user) }
    end
  end
end
