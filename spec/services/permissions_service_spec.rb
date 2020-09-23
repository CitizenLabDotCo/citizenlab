require "rails_helper"

describe PermissionsService do
  let(:service) { PermissionsService.new }

  describe "posting_initiative_disabled_reason" do
    before do
      service.update_global_permissions
    end

    it "returns nil when posting is allowed" do
      permission = Permission.find_by(permission_scope: nil, action: 'posting_initiative')
      groups = create_list(:group, 2)
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.posting_initiative_disabled_reason(user)).to be_nil
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      permission = Permission.find_by(permission_scope: nil, action: 'posting_initiative')
      permission.update!(permitted_by: 'users')
      expect(service.posting_initiative_disabled_reason(nil)).to eq 'not_signed_in'
    end

    it "returns `not_permitted` when posting is not permitted" do
      permission = Permission.find_by(permission_scope: nil, action: 'posting_initiative')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.posting_initiative_disabled_reason(create(:user))).to eq 'not_permitted'
    end
  end

  describe "commenting_initiative_disabled_reason" do
    before do
      service.update_global_permissions
    end

    it "returns nil when the commenting is allowed" do
      expect(service.commenting_initiative_disabled_reason(create(:user))).to be_nil
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      permission = Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
      permission.update!(permitted_by: 'users')
      expect(service.commenting_initiative_disabled_reason(nil)).to eq 'not_signed_in'
    end

    it "returns `not_permitted` when commenting is not permitted for the user" do
      permission = Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.commenting_initiative_disabled_reason(create(:user))).to eq 'not_permitted'
    end
  end

  describe "voting_initiative_disabled_reason" do
    before do
      service.update_global_permissions
    end

    it "returns nil when the voting is allowed" do
      expect(service.voting_initiative_disabled_reason(create(:user))).to be_nil
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      permission = Permission.find_by(permission_scope: nil, action: 'voting_initiative')
      permission.update!(permitted_by: 'users')
      expect(service.voting_initiative_disabled_reason(nil)).to eq 'not_signed_in'
    end

    it "returns `not_permitted` when voting is not permitted for the user" do
      permission = Permission.find_by(permission_scope: nil, action: 'voting_initiative')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.voting_initiative_disabled_reason(create(:user))).to eq 'not_permitted'
    end
  end

  describe "cancelling_votes_disabled_reason_for_initiative" do
    before do
      service.update_global_permissions
    end

    it "returns nil when the voting is allowed" do
      expect(service.cancelling_votes_disabled_reason_for_initiative(create(:user))).to be_nil
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      permission = Permission.find_by(permission_scope: nil, action: 'voting_initiative')
      permission.update!(permitted_by: 'users')
      expect(service.cancelling_votes_disabled_reason_for_initiative(nil)).to eq 'not_signed_in'
    end

    it "returns `not_permitted` when voting is not permitted for the user" do
      permission = Permission.find_by(permission_scope: nil, action: 'voting_initiative')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.cancelling_votes_disabled_reason_for_initiative(create(:user))).to eq 'not_permitted'
    end
  end

  describe "voting_disabled_reason_for_initiative_comment" do
    before do
      service.update_global_permissions
    end

    it "returns nil when the commenting is allowed" do
      expect(service.voting_disabled_reason_for_initiative_comment(create(:user))).to be_nil
    end

    it "returns `not_signed_in` when user needs to be signed in" do
      permission = Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
      permission.update!(permitted_by: 'users')
      expect(service.voting_disabled_reason_for_initiative_comment(nil)).to eq 'not_signed_in'
    end

    it "returns `not_permitted` when commenting is not permitted for the user" do
      permission = Permission.find_by(permission_scope: nil, action: 'commenting_initiative')
      permission.update!(permitted_by: 'groups', 
        group_ids: create_list(:group, 2).map(&:id)
        )
      expect(service.voting_disabled_reason_for_initiative_comment(create(:user))).to eq 'not_permitted'
    end
  end
end