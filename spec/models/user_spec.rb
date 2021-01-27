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
      expect(u.slug).to eq("not-really--40-286-sluggable")
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

  describe 'email' do
    it 'is invalid if there is a case insensitive duplicate' do
      u1 = create(:user, email: 'KoEn@citizenlab.co')
      u2 = build(:user, email: 'kOeN@citizenlab.co')
      expect(u2).to be_invalid
    end

    it 'is invalid if the domain is on our blacklist' do
      u1 = build(:user, email: 'xwrknecgyq_1542135485@039b1ee.netsolhost.com')
      expect(u1).to be_invalid
      expect(u1.errors.details[:email]).to eq [{error: :domain_blacklisted, value: "039b1ee.netsolhost.com"}]
    end
  end

  describe 'password' do
    before do
      CommonPassword.initialize!
    end

    it 'is invalid when set to empty string' do
      u = build(:user, password: '')
      expect(u).to be_invalid
    end

    it 'is invalid if its a common password' do
      u = build(:user, password: 'batman')
      expect(u).to be_invalid
    end

    it 'is valid when its a strong password' do
      u = build(:user, password: '9x6TUuzSfkzyQrQFhxN9')
      expect(u).to be_valid
    end
  end

  describe "bio sanitizer" do
    it "sanitizes script tags in the body" do
      user = create(:user, bio_multiloc: {
        "en" => "<p>Test</p><script>This should be removed!</script>"
      })
      expect(user.bio_multiloc).to eq({"en" => "<p>Test</p>This should be removed!"})
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

    it "response true when the user is project_moderator and no project_id is passed" do
      u = build(:user, roles: [{type: "project_moderator"}])
      expect(u.project_moderator?).to eq true
    end

    it "response false when the user is not a project_moderator and no project_id is passed" do
      u = build(:admin)
      expect(u.project_moderator?).to eq false
    end
  end

  describe "add_role" do
    it "gives a user moderator rights for a project" do 
      usr = create(:user, roles: [])
      prj = create(:project)
      expect(usr.project_moderator? prj.id).to eq false

      usr.add_role 'project_moderator', project_id: prj.id
      expect(usr.save).to eq true
      expect(usr.project_moderator? prj.id).to eq true
      expect(usr.project_moderator? create(:project).id).to eq false
    end
  end

  describe "delete_role" do
    it "denies a user from his moderator rights" do
      prj = create(:project)
      mod = create(:moderator, project: prj)

      mod.delete_role 'project_moderator', project_id: prj.id
      expect(mod.save).to eq true
      expect(mod.project_moderator? prj.id).to eq false
    end

    it "denies a user from his admin rights" do
      prj = create(:project)
      adm = create(:moderator, project: prj)

      adm.delete_role 'admin'
      expect(adm.save).to eq true
      expect(adm.admin?).to eq false
    end
  end

  describe "locale" do
    before do
      settings = AppConfiguration.instance.settings
      settings['core']['locales'] = ["en","nl-BE","fr-FR"]
      AppConfiguration.instance.update!(settings: settings)
    end

    it "is valid when it's one of the configured locales" do
      user = build(:user, locale: "nl-BE")
      expect(user).to be_valid
    end

    it "is invalid when it's not one of the configured locales" do
      user = build(:user, locale: "pt")
      expect{ user.valid? }.to change{ user.errors[:locale] }
    end
  end

  describe "slug" do

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
      TenantTemplateService.new.resolve_and_apply_template 'base', external_subfolder: false
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
      expect(build(:user, birthyear: (Time.now.year - 117))).to be_valid
      expect(build(:user, birthyear: (Time.now.year - 13))).to be_valid
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
      expect(user.groups).to match_array [manual_group]
      expect(user.group_ids).to match_array [manual_group.id]
    end

    it "returns rule groups" do
      user = create(:user, email: 'user@test.com')
      expect(user.groups).to match_array [rules_group]
      expect(user.group_ids).to match_array [rules_group.id]
    end

    it "returns manual groups and rule groups" do
      user = create(:user, manual_groups: [manual_group], email: 'user@test.com')
      expect(user.groups).to match_array [manual_group, rules_group]
      expect(user.group_ids).to match_array [manual_group.id, rules_group.id]
    end
  end

  describe "in_group" do
    it "gets all users in a manual group" do
      group = create(:group)
      users = create_list(:user, 3, manual_groups: [group])
      create_list(:user, 2)
      expect(User.in_group(group).pluck(:id)).to match_array users.map(&:id) 
    end

    it "gets all users in a rules group" do
      group = create(:smart_group)
      user1 = create(:user, email: 'jos@test.com')
      user2 = create(:user, email: 'jules@test.com')
      user3 = create(:user)
      user4 = create(:user, manual_groups: [create(:group)])

      expect(User.in_group(group).pluck(:id)).to match_array [user1.id, user2.id]
    end
  end

  describe "in_any_group" do

    it "gets the union of all users in the given groups" do
      group1 = create(:smart_group)
      group2 = create(:group)
      user1 = create(:user, email: 'jos@test.com', manual_groups: [group2])
      user2 = create(:user, email: 'jules@test.com')
      user3 = create(:user)
      user4 = create(:user, manual_groups: [group2])

      expect(User.in_any_group([group1, group2])).to match_array [user1, user2, user4]
    end
  end

  describe "find_by_cimail" do
    before do
      create_list(:user, 3)
    end

    it "finds a user with the same email but different caps" do
      some_user = create(:user, email: 'SeBi@citizenlab.co')
      same_user = User.find_by_cimail 'sEbI@citizenlab.co'

      expect(some_user.id).to eq same_user&.id
    end
  end

  describe "super_admin?" do
    it "returns true for admins with various citizenlab email variations" do
      users = [
        build_stubbed(:admin, email: 'hello@citizenlab.co'),
        build_stubbed(:admin, email: 'hello+admin@citizenLab.co'),
        build_stubbed(:admin, email: 'hello@citizenlab.eu'),
        build_stubbed(:admin, email: 'moderator+admin@citizenlab.be'),
        build_stubbed(:admin, email: 'some.person@citizen-lab.fr'),
        build_stubbed(:admin, email: 'cheese.lover@CitizenLab.ch'),
        build_stubbed(:admin, email: 'Fritz+Wurst@Citizenlab.de'),
        build_stubbed(:admin, email: 'breek.nou.mijn.klomp@citizenlab.NL'),
        build_stubbed(:admin, email: 'bigger@citizenlab.us'),
        build_stubbed(:admin, email: 'magdalena@citizenlab.cl'),
        build_stubbed(:admin, email: 'hello+admin@CITIZENLAB.UK'),
      ]

      expect(users).to all be_super_admin
    end

    it "returns false for non-citizenlab emails" do
      strangers = [
        build_stubbed(:admin, email: 'hello@citizenlab.com'),
        build_stubbed(:admin, email: 'citizenlab.co@gmail.com'),
        *3.times.map{build_stubbed(:admin)}
      ]
      expect(strangers).not_to include(be_super_admin)
    end

    it "returns false for non-admins" do
      user = build_stubbed(:user, email: 'hello@citizenlab.co')
      expect(user).not_to be_super_admin
    end
  end

  describe "highest_role" do
    it "correctly returns the highest role the user posesses" do
      expect(build_stubbed(:admin, email: 'hello@citizenlab.co').highest_role).to eq :super_admin
      expect(build_stubbed(:admin).highest_role).to eq :admin
      expect(build_stubbed(:moderator).highest_role).to eq :project_moderator
      expect(build_stubbed(:user).highest_role).to eq :user
    end
  end

end
