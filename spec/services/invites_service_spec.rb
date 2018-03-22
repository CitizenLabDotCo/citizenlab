require "rails_helper"

describe InvitesService do
  let(:service) { InvitesService.new }

  before do
    settings = Tenant.current.settings
    settings['core']['locales'] = ['fr','en','nl']
    Tenant.current.update(settings: settings)
    create_list(:group, 3)
  end

  describe "bulk_create_xlsx" do
    let(:users) { build_list(:user, 10)}
    let(:hash_array) { users.map do |user|
      {
        email: user.email,
        first_name: rand(3) == 0 ? user.first_name : nil,
        last_name: rand(3) == 0 ? user.last_name : nil,
        locale: rand(3) == 0 ? user.locale : nil,
        admin: rand(5) == 0 ? true : nil,
        groups: rand(3) == 0 ? rand(3).times.map{Group.offset(rand(Group.count)).first.title_multiloc.first}.join(',') : nil
      }
    end}
    let(:xlsx) { XlsxService.new.hash_array_to_xlsx(hash_array) }
    let(:inviter) { create(:user) }

    it "correctly creates invites when all is fine" do
      expect{ service.bulk_create_xlsx(xlsx, inviter) }.to change{Invite.count}.from(0).to(10)
    end
  end

end
