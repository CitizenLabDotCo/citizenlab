require 'rails_helper'

RSpec.describe User, type: :model do

  describe "Default factory" do
    it "is valid" do
      expect(build(:user)).to be_valid
    end
  end

  describe "creating a user" do
    it "generates a slug" do
      u = build(:user)
      u.first_name = "Not Really_%40)"
      u.last_name = "286^$@sluggable"
      u.save
      expect(u.slug).to eq("not-really_-40-286-sluggable")
    end
  end

  describe "creating an invited user" do
    it "has correct linking between invite and invitee" do
      invitee = create(:invited_user)
      expect(invitee.invitee_invite.invitee.id).to eq invitee.id
    end
  end

  describe "user password authentication" do
    it "should be compatible with meteor encryption" do
      u = build(:user)
      u.first_name = "Sebi"
      u.last_name = "Hoorens"
      u.email = 'sebastien@citizenlab.co'
      u.password_digest = '$2a$10$npkXzpkkyO.g6LjmSYHbOeq76gxpOYeei8SVsjr0LqsBiAdTeDhHK'
      u.save
      expect(!!u.authenticate('supersecret')).to eq(true)
      expect(!!u.authenticate('totallywrong')).to eq(false)
    end

    it "should replace the CL1 hash by the CL2 hash" do
      u = build(:user)
      u.first_name = "Sebi"
      u.last_name = "Hoorens"
      u.email = 'sebastien@citizenlab.co'
      u.password_digest = '$2a$10$npkXzpkkyO.g6LjmSYHbOeq76gxpOYeei8SVsjr0LqsBiAdTeDhHK'
      u.save
      expect(!!u.authenticate('supersecret')).to eq(true)
      expect(u.password_digest).not_to eq('$2a$10$npkXzpkkyO.g6LjmSYHbOeq76gxpOYeei8SVsjr0LqsBiAdTeDhHK')
      expect(!!BCrypt::Password.new(u.password_digest).is_password?('supersecret')).to eq(true)
      expect(!!u.authenticate('supersecret')).to eq(true)
      expect(!!u.authenticate('totallywrong')).to eq(false)
    end
  end

  describe "roles" do

    it "is valid without roles" do
      u = build(:user, roles: [])
      expect(u).to be_valid
    end

    it "is valid when the user is an admin" do
      u = build(:user, roles: [{type: "admin"}])
      expect(u).to be_valid
    end

    it "is valid when the user is a project moderator" do
      project = create(:project)
      u = build(:user, roles: [{type: "project_moderator", project_id: project.id}])
      expect(u).to be_valid
    end

    it "is invalid when the user has an unknown role type" do
      u = build(:user, roles: [{type: "stonecarver"}])
      expect{ u.valid? }.to change{ u.errors[:roles] }
    end

    it "is invalid when a project_moderator is missing a project_id" do
      u = build(:user, roles: [{type: "project_moderator"}])
      expect{ u.valid? }.to change{ u.errors[:roles] }
    end

  end

  describe "admin?" do

    it "responds true when the user has the admin role" do
      u = build(:user, roles: [{type: "admin"}])
      expect(u.admin?).to eq true
    end

    it "responds false when the user does not have the admin role" do
      u = build(:user, roles: [])
      expect(u.admin?).to eq false
    end

  end

  describe "project_moderator?" do

    it "responds true when the user has the project_moderator role" do
      l = create(:project)
      u = build(:user, roles: [{type: "project_moderator", project_id: l.id}])
      expect(u.project_moderator? l.id).to eq true
    end

    it "responds false when the user does not have a project_moderator role" do
      l = create(:project)
      u = build(:user, roles: [])
      expect(u.project_moderator? l.id).to eq false
    end

    it "responds false when the user does not have a project_moderator role for the given project" do
      l1 = create(:project)
      l2 = create(:project)
      u = build(:user, roles: [{type: "project_moderator", project_id: l1.id}])
      expect(u.project_moderator? l2.id).to eq false
    end

  end

  describe "locale" do
    before do
      tenant = Tenant.current
      settings = tenant.settings
      settings['core']['locales'] = ["en","nl","fr"]
      tenant.update!(settings: settings)
    end

    it "is valid when it's one of the tenant locales" do
      user = build(:user, locale: "nl")
      expect(user).to be_valid
    end

    it "is invalid when it's not one of the tenant locales" do
      user = build(:user, locale: "pt")
      expect{ user.valid? }.to change{ user.errors[:locale] }
    end
  end

  describe "slug" do

    it "is valid when it's only containing alphanumeric and hyphens" do
      user = build(:user, slug: 'aBc-123-g3S')
      expect(user).to be_valid
    end

    it "is invalid when there's others than alphanumeric and hyphens" do
      user = build(:user, slug: 'ab_c-.asdf@')
      expect{ user.valid? }.to change{ user.errors[:slug] }
    end

    it "is generated on create when not given" do
      user = create(:user, slug: nil)
      expect(user.slug).to be_present
    end

  end

  describe "avatar" do

    it "is blank generated when it's not specified" do
      user = build(:user, avatar: nil)
      user.save
      expect(user.avatar).to be_blank
    end
  end

  describe "demographic fields", slow_test: true do
    before do
      TenantTemplateService.new.apply_template 'base'
    end

    it "(gender) is valid when male, female or unspecified" do
      expect(build(:user, gender: 'male')).to be_valid
      expect(build(:user, gender: 'female')).to be_valid
      expect(build(:user, gender: 'unspecified')).to be_valid
    end

    it "(gender) is invalid when not male, female or unspecified" do
      user = build(:user, gender: 'somethingelse')
      expect{ user.valid? }.to change{ user.errors[:gender] }
    end

    it "(birthyear) is valid when in realistic range" do
      expect(build(:user, birthyear: (Time.now.year - 117).to_s)).to be_valid
      expect(build(:user, birthyear: (Time.now.year - 13).to_s)).to be_valid
    end

    it "(birthyear) is invalid when unrealistic" do
      user = build(:user, birthyear: Time.now.year + 1)
      expect{ user.valid? }.to change{ user.errors[:birthyear] }
      user = build(:user, birthyear: 1850)
      expect{ user.valid? }.to change{ user.errors[:birthyear] }
      user = build(:user, birthyear: "eighteen hundred")
      expect{ user.valid? }.to change{ user.errors[:birthyear] }
    end

    it "(birthyear) is invalid when not an integer" do
      user = build(:user, birthyear: "eighteen hundred")
      expect{ user.valid? }.to change{ user.errors[:birthyear] }
      user = build(:user, birthyear: 1930.4)
      expect{ user.valid? }.to change{ user.errors[:birthyear] }
    end

    it "(domicile) is valid when an area id or 'outside'" do
      create_list(:area, 5)
      expect(build(:user, domicile: Area.offset(rand(5)).first.id)).to be_valid
      expect(build(:user, domicile: 'outside')).to be_valid
    end

    it "(domicile) is invalid when not an area id or 'outside'" do
      user = build(:user, domicile: 'somethingelse')
      expect{ user.valid? }.to change{ user.errors[:domicile] }
      user = build(:user, domicile: 5)
      expect{ user.valid? }.to change{ user.errors[:domicile] }
    end

    it "(education) is valid when an ISCED2011 level" do
      CustomField.find_by(code: 'education').update(enabled: true)
      expect(build(:user, education: '2')).to be_valid
      expect(build(:user, education: '4')).to be_valid
      expect(build(:user, education: '8')).to be_valid
    end

    it "(education) is invalid when not an isced 2011 level" do
      CustomField.find_by(code: 'education').update(enabled: true)
      user = build(:user, education: 'somethingelse')
      expect{ user.valid? }.to change{ user.errors[:education] }
      user = build(:user, education: 9)
      expect{ user.valid? }.to change{ user.errors[:education] }
      user = build(:user, education: 2.4)
      expect{ user.valid? }.to change{ user.errors[:education] }
    end

  end


  describe "order_role" do

    before do
      10.times do |i|
        create(rand(2)==0 ? :admin : :user)
      end
    end

    it "sorts from higher level roles to lower level roles by default" do
      serie = User.order_role.map{|u| u.roles.size}
      expect(serie).to eq serie.sort.reverse
    end

    it "sorts from lower level roles to higher level roles with option asc" do
      serie = User.order_role(:desc).map{|u| u.roles.size}
      expect(serie).to eq serie.sort
    end

  end

  describe "build_with_omniauth" do
    it "creates a new user" do
      auth = OpenStruct.new({
        provider: 'someprovider',
        info: {
          first_name: 'Jos',
          last_name: 'Jossens',
          email: 'jos@josnet.com',
          image: 'http://www.josnet.com/my-picture'
        }
      })

      ssos = instance_double("SingleSignOnService")
      expect(SingleSignOnService).to receive(:new).and_return(ssos)
      expect(ssos).to receive(:profile_to_user_attrs).with('someprovider', auth).and_return({})
      expect(User).to receive(:new)
      User.build_with_omniauth(auth)
    end
  end

  describe "custom_field_values" do
    it "validates when custom_field_values have changed" do
      u = create(:user)
      u.custom_field_values = {
        somekey: "somevalue"
      }
      expect{ u.save }.to change{ u.errors[:custom_field_values]}
    end

    it "doesn't validate when custom_field_values hasn't changed" do
      u = build(:user, custom_field_values: {somekey: 'somevalue' })
      u.save(validate: false)
      expect{ u.save }.not_to change{ u.errors[:custom_field_values] }
    end

  end

  describe "active?" do
    it "returns false when the user has not completed signup" do
      u = build(:user, registration_completed_at: nil)
      expect(u.active?).to be false
    end

    it "return false when the user has a pending invitation" do
      u = build(:user, invite_status: 'pending')
      expect(u.active?).to be false
    end

    it "returns true when the user has completed signup" do
      u = build(:user)
      expect(u.active?).to be true
    end
  end

  describe "groups and group_ids" do
    let!(:manual_group) { create(:group) }
    let!(:rules_group) {
      create(:smart_group, rules: [
        {ruleType: 'email', predicate: 'is', value: 'user@test.com'}
      ])
    }

    it "returns manual groups" do
      user = create(:user, manual_groups: [manual_group])
      expect(user.groups).to match [manual_group]
      expect(user.group_ids).to match [manual_group.id]
    end

    it "returns rule groups" do
      user = create(:user, email: 'user@test.com')
      expect(user.groups).to match [rules_group]
      expect(user.group_ids).to match [rules_group.id]
    end

    it "returns manual groups and rule groups" do
      user = create(:user, manual_groups: [manual_group], email: 'user@test.com')
      expect(user.groups).to match [manual_group, rules_group]
      expect(user.group_ids).to match [manual_group.id, rules_group.id]
    end
  end



end
