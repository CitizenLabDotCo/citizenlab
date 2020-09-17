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
end