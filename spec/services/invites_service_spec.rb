require "rails_helper"

describe InvitesService do
  let(:service) { InvitesService.new }

  before do
    settings = AppConfiguration.instance.settings
    settings['core']['locales'] = ['fr','en','nl']
    AppConfiguration.instance.update(settings: settings)
  end

  describe "bulk_create_xlsx" do
    
    let(:xlsx) { XlsxService.new.hash_array_to_xlsx(hash_array) }

    context do
      let!(:groups) { create_list(:group, 3) }
      let(:users) { build_list(:user, 10)}
      let(:hash_array) { (users.map do |user|
        {
          email: user.email,
          first_name: rand(3) == 0 ? user.first_name : nil,
          last_name: rand(3) == 0 ? user.last_name : nil,
          language: rand(3) == 0 ? user.locale : nil,
          admin: rand(5) == 0 ? true : nil,
          groups: rand(3) == 0 ? rand(3).times.map{Group.offset(rand(Group.count)).first.title_multiloc.values.first}.uniq.join(',') : nil
        }
      end + [{},{},{}]).shuffle }
      let(:inviter) { create(:user) }

      it "correctly creates invites when all is fine" do
        expect{ service.bulk_create_xlsx(xlsx, {}, inviter) }.to change{Invite.count}.from(0).to(10)
      end
    end

    context "with user custom fields configured" do
      before do
        create(:custom_field,
          key: 'text_field',
          input_type: 'text',
          title_multiloc: {'en' => 'size', 'nl-NL' => 'grootte'},
          description_multiloc: {'en' => 'How big is it?', 'nl-NL' => 'Hoe groot is het?'}
        )
        create(:custom_field,
          key: 'checkbox_field',
          input_type: 'checkbox'
        )
        create(:custom_field,
          key: 'float_field',
          input_type: 'number'
        )
        create(:custom_field,
          key: 'integer_field',
          input_type: 'number'
        )
      end

      let(:hash_array) {[
        {email: "user1@domain.net", text_field: "some_value"},

        {email: "user2@domain.net", checkbox_field: "1"},
        {email: "user3@domain.net", checkbox_field: "true"},
        {email: "user4@domain.net", checkbox_field: 0},
        {email: "user5@domain.net", checkbox_field: "FALSE"},

        {email: "user6@domain.net", float_field: "666.34"},
        {email: "user7@domain.net", integer_field: "1873050293742134"}
      ]}

      it "initializes custom_field_values with matching column names and appropriate types" do
        expect{ service.bulk_create_xlsx(xlsx, {}) }.to change{Invite.count}.from(0).to(7)

        user = User.find_by(email: "user1@domain.net")
        expect(user.custom_field_values).to eq({"text_field" => "some_value"})

        user = User.find_by(email: "user2@domain.net")
        expect(user.custom_field_values).to eq({"checkbox_field" => true})

        user = User.find_by(email: "user3@domain.net")
        expect(user.custom_field_values).to eq({"checkbox_field" => true})

        user = User.find_by(email: "user4@domain.net")
        expect(user.custom_field_values).to eq({"checkbox_field" => false})

        user = User.find_by(email: "user5@domain.net")
        expect(user.custom_field_values).to eq({"checkbox_field" => false})

        user = User.find_by(email: "user6@domain.net")
        expect(user.custom_field_values).to eq({"float_field" => 666.34})

        user = User.find_by(email: "user7@domain.net")
        expect(user.custom_field_values).to eq({"integer_field" => 1873050293742134})
      end
    end

    context "with custom field that has the wrong type" do

      before do
        create(:custom_field,
               key: 'checkbox_field',
               input_type: 'checkbox'
        )
        create(:custom_field,
               key: 'number_field',
               input_type: 'number'
        )
      end

      let(:hash_array) {[
          {email: "user1@domain.net", number_field: "nan"},
          {email: "user2@domain.net", checkbox_field: "non-truthy"},
      ]}

      it "raises 'InviteError' errors" do

        expect{ service.bulk_create_xlsx(xlsx, {}) }.to raise_error do |e|
          expect(e).to be_a(InvitesService::InvitesFailedError)
          expect(e.errors.length).to be(2)

          error = e.errors[0]
          expect(error).to be_a(InvitesService::InviteError)
          expect(error.error_key).to eq('malformed_custom_field_value')
          expect(error.value).to eq('nan')

          error = e.errors[1]
          expect(error).to be_a(InvitesService::InviteError)
          expect(error.error_key).to eq('malformed_custom_field_value')
          expect(error.value).to eq('non-truthy')

        end
      end
    end

    context "with file that exceeds maximum supported number of invites" do
      let(:hash_array) { (InvitesService::MAX_INVITES+1).times.each.map{ {first_name: 'Jezus'} } }

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

    context "with an unknown language value" do
      let(:hash_array) {[
        {language: 'qq'}
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

    context "with an email that is already used by an active user (case insensitive)" do
      before { create(:user, email: 'someUser@somedomain.com') }
      let(:hash_array) {[
        {email: 'john@john.son'},
        {email: 'Someuser@somedomain.com'}
      ]}

      it "doesn't send out invitations to the existing users" do
        expect{ service.bulk_create_xlsx(xlsx) }.to change{Invite.count}.from(0).to(1)
      end
    end

    context "with an email that is already invited" do
      let!(:invite) { create(:invite) }
      let(:hash_array) {[
        {email: invite.invitee.email}
      ]}

      it "doesn't send out invitations to the invited users" do
        service.bulk_create_xlsx(xlsx)
        expect(Invite.count).to eq 1
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

    context "with duplicate first and last names" do
      let(:hash_array) {[
        {first_name: 'John', last_name: 'Johnson'},
        {first_name: 'John', last_name: 'Johnson'},
      ]}
      it "succeeds with unique slugs" do
        expect{ service.bulk_create_xlsx(xlsx) }.to change{Invite.count}.from(0).to(2)
      end
    end

    context "with send_invite_email set to false" do
      let(:hash_array) {[
        {email: "test1@example.com", send_invite_email: "FALSE"},
        {email: "test2@example.com", send_invite_email: "0"},
        {email: "test3@example.com", send_invite_email: "false"},
      ]}

      it "sets send_invite_email attribute to false in the invite" do
        expect{ service.bulk_create_xlsx(xlsx) }.to change{Invite.count}.from(0).to(3)
        expect(Invite.all.pluck(:send_invite_email)).to eq [false, false, false]
      end
    end

    context "with send_invite_email set to true" do
      let(:hash_array) {[
        {email: "test1@example.com", send_invite_email: "TRUE"},
        {email: "test2@example.com", send_invite_email: "1"},
        {email: "test3@example.com", send_invite_email: "true"},
      ]}

      it "sets send_invite_email attribute to true in the invite" do
        expect{ service.bulk_create_xlsx(xlsx) }.to change{Invite.count}.from(0).to(3)
        expect(Invite.all.pluck(:send_invite_email)).to eq [true, true, true]
      end
    end

    context "with send_invite_email missing" do
      let(:hash_array) {[
        {email: "test1@example.com"}
      ]}

      it "sets send_invite_email attribute to true in the invite" do
        expect{ service.bulk_create_xlsx(xlsx) }.to change{Invite.count}.from(0).to(1)
        expect(Invite.first.send_invite_email).to be true
      end
    end
  end

end
