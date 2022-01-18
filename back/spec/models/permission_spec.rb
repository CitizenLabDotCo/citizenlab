require 'rails_helper'

RSpec.describe Permission, type: :model do
  describe "#for_user" do
    before(:all) do
      # rubocop:disable RSpec/BeforeAfterAll
      @scope_types = PermissionsService.instance_variable_get(:@scope_spec_hash)

      # rubocop:disable Style/SingleLineMethods Layout/EmptyLineBetweenDefs
      dummy_global_scope = Module.new do
        def self.actions(_scope = nil) %w[a1 a2 a3 a4 a5] end
        def self.scope_type; nil end
        def self.scope_class; nil end
      end
      # rubocop:enable Style/SingleLineMethods Layout/EmptyLineBetweenDefs

      PermissionsService.clear_scope_types
      PermissionsService.register_scope_type(dummy_global_scope)
    end

    after(:all) do
      # Restore registered scope-types as they were before the tests.
      PermissionsService.instance_variable_set(:@scope_spec_hash, @scope_types)
    end

    before(:each) { described_class.destroy_all }

    # +let!(permissions)+ must be run after +before(:each)+ which deletes all permission records
    let!(:permissions) do
      [
        create(:global_permission, :by_everyone, action: 'a1'),
        create(:global_permission, :by_users, action: 'a2'),
        create(:global_permission, :by_admins_moderators, action: 'a3'),
        create(:global_permission, permitted_by: 'groups', groups: [manual_grp], action: 'a4')
      ]
    end
    let(:manual_grp) { create(:group) }

    context "when user is admin" do
      let(:admin) { build(:admin) }

      it { expect(described_class.for_user(admin)).to match_array permissions }
    end

    context "when not logged in" do
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

  describe '#denied_reason' do
    let(:everyone_permission) { build(:permission, :by_everyone) }
    let(:users_permission) { build(:permission, :by_users) }
    let(:admins_mods_permission) { build(:permission, :by_admins_moderators) }

    context 'when not signed in' do
      let(:user) { nil }

      it { expect(everyone_permission.denied_reason(user)).to be_falsey }
      it { expect(users_permission.denied_reason(user)).to eq('not_signed_in') }
      it { expect(admins_mods_permission.denied_reason(user)).to eq('not_permitted') }
    end

    context 'when user is admin' do
      let(:admin) { build(:admin) }

      it { expect(everyone_permission.denied_reason(admin)).to be_falsey }
      it { expect(users_permission.denied_reason(admin)).to be_falsey }
      it { expect(admins_mods_permission.denied_reason(admin)).to be_falsey }
    end

    context 'when signed in' do
      let(:user) { build(:user) }

      it { expect(everyone_permission.denied_reason(user)).to be_falsey }
      it { expect(users_permission.denied_reason(user)).to be_falsey }
      it { expect(admins_mods_permission.denied_reason(user)).to eq 'not_permitted' }
    end
  end
end
