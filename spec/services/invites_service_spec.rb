require "rails_helper"

describe InvitesService do
  let(:service) { InvitesService.new }

  before do
    settings = Tenant.current.settings
    settings['core']['locales'] = ['fr','en','nl']
    Tenant.current.update(settings: settings)
  end

  describe "bulk_create_xlsx" do
    
    let(:xlsx) { XlsxService.new.hash_array_to_xlsx(hash_array) }

    context do
      let!(:groups) { create_list(:group, 3) }
      let(:users) { build_list(:user, 10)}
      let(:hash_array) { users.map do |user|
        {
          email: user.email,
          first_name: rand(3) == 0 ? user.first_name : nil,
          last_name: rand(3) == 0 ? user.last_name : nil,
          locale: rand(3) == 0 ? user.locale : nil,
          admin: rand(5) == 0 ? true : nil,
          groups: rand(3) == 0 ? rand(3).times.map{Group.offset(rand(Group.count)).first.title_multiloc.values.first}.join(',') : nil
        }
      end}
      let(:inviter) { create(:user) }

      it "correctly creates invites when all is fine" do
        expect{ service.bulk_create_xlsx(xlsx, {}, inviter) }.to change{Invite.count}.from(0).to(10)
      end
    end

    context "with file that exceeds maximum supported number of invites" do
      let(:hash_array) { (InvitesService::MAX_INVITES+1).times.each.map{{}} }

      it "fails with max_invites_limit_exceeded error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:max_invites_limit_exceeded]
      end
    end

    context "with no invites specified" do
      let(:hash_array) { [] }

      it "fails with no_invites_specified error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:no_invites_specified]
      end
    end

    context "with a reference to a non-existing group" do
      let(:hash_array) {[
        {groups: "The Jackson 5, #{create(:group).title_multiloc.values.first}"}
      ]}

      it "fails with unknown_group error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:unknown_group]
        expect(service.errors.first.row).to eq 2
        expect(service.errors.first.value).to eq 'The Jackson 5'
      end
    end

    context "with a malformed groups field" do
      let(:hash_array) {[
        {},
        {groups: 24}
      ]}

      it "fails with malformed_groups_value error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:malformed_groups_value]
        expect(service.errors.first.row).to eq 3
        expect(service.errors.first.value).to eq 24
      end
    end

    context "with a malformed admin field" do
      let(:hash_array) {[
        {admin: 'yup'}
      ]}

      it "fails with malformed_admin_value error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:malformed_admin_value]
        expect(service.errors.first.row).to eq 2
        expect(service.errors.first.value).to eq 'yup'
      end
    end

    context "with an unknown locale field" do
      let(:hash_array) {[
        {locale: 'qq'}
      ]}

      it "fails with unknown_locale error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:unknown_locale]
        expect(service.errors.first.row).to eq 2
        expect(service.errors.first.value).to eq 'qq'
      end
    end

    context "with an invalid email field" do
      let(:hash_array) {[
        {email: 'this.can\'t be an email'}
      ]}

      it "fails with invalid_email error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:invalid_email]
        expect(service.errors.first.row).to eq 2
        expect(service.errors.first.value).to eq 'this.can\'t be an email'
      end
    end

    context "with an email that is already used by an active user" do
      before { create(:user, email: 'someuser@somedomain.com') }
      let(:hash_array) {[
        {email: 'someuser@somedomain.com'}
      ]}

      it "fails with email_already_active error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:email_already_active]
        expect(service.errors.first.row).to eq 2
        expect(service.errors.first.value).to eq 'someuser@somedomain.com'
      end
    end

    context "with an email that is already invited" do
      let!(:invite) { create(:invite) }
      let(:hash_array) {[
        {email: invite.invitee.email}
      ]}

      it "fails with email_already_invited error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:email_already_invited]
        expect(service.errors.first.row).to eq 2
        expect(service.errors.first.value).to eq invite.invitee.email
      end
    end


    context "with duplicate emails" do
      let(:hash_array) {[
        {email: 'someuser@somedomain.com'},
        {email: 'someuser@somedomain.com'},
        {},
        {email: 'someuser@somedomain.com'},
      ]}

      it "fails with email_duplicate error" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error(InvitesService::InvitesFailedError)
        expect(service.errors.size).to eq 1
        expect(service.errors.first.error_key).to eq InvitesService::INVITE_ERRORS[:emails_duplicate]
        expect(service.errors.first.rows).to eq [2,3,5]
        expect(service.errors.first.value).to eq 'someuser@somedomain.com'
      end
    end


  end

end