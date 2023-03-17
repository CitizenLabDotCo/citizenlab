# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:user)).to be_valid
    end
  end

  describe '.destroy_all_async' do
    before { create_list(:user, 2) }

    it 'enqueues a user-deletion job for each user' do
      expect { described_class.destroy_all_async }
        .to have_enqueued_job(DeleteUserJob).exactly(described_class.count).times
    end
  end

  describe 'creating a user' do
    it 'generates a slug' do
      u = build(:user)
      u.first_name = 'Not Really_%40)'
      u.last_name = '286^$@sluggable'
      u.save
      expect(u.slug).to eq('not-really--40-286-sluggable')
    end
  end

  describe 'creating an invited user' do
    it 'has correct linking between invite and invitee' do
      invitee = create(:invited_user)
      expect(invitee.invitee_invite.invitee.id).to eq invitee.id
    end

    it 'does not generate a slug if no names given' do
      invitee = create(:invited_user, first_name: nil, last_name: nil)
      expect(invitee.slug).to be_nil
    end
  end

  describe 'blocked?' do
    let!(:user1) { create(:user, block_end_at: 1.day.from_now) }
    let!(:user2) { create(:user, block_end_at: 5.minutes.ago) }
    let!(:user3) { create(:user, block_end_at: 5.days.from_now) }

    it 'Blocked users should be blocked for block duration' do
      expect(user1.blocked?).to be(true)
      expect(user2.blocked?).to be(false)
    end

    it "Blocked users 'blocked' status should be decoupled from user_blocking feature flag" do
      settings = AppConfiguration.instance.settings
      settings['user_blocking'] = { 'enabled' => false, 'allowed' => false, 'duration' => 90 }
      AppConfiguration.instance.update!(settings: settings)

      expect(user1.blocked?).to be(true)
      expect(user2.blocked?).to be(false)
    end

    it 'Blocked users should be returned in scope :blocked' do
      blocked_users = described_class.all.blocked

      expect(blocked_users.count).to eq 2
      expect(blocked_users).to match_array([user1, user3])
      expect(blocked_users).not_to include(user2)
    end
  end

  describe 'user password authentication' do
    it 'should be compatible with meteor encryption' do
      u = build(:user)
      u.first_name = 'Sebi'
      u.last_name = 'Hoorens'
      u.email = 'sebastien@citizenlab.co'
      u.password_digest = '$2a$10$npkXzpkkyO.g6LjmSYHbOeq76gxpOYeei8SVsjr0LqsBiAdTeDhHK'
      u.save
      expect(!!u.authenticate('supersecret')).to be(true)
      expect(!!u.authenticate('totallywrong')).to be(false)
    end

    it 'should replace the CL1 hash by the CL2 hash' do
      u = build(:user)
      u.first_name = 'Sebi'
      u.last_name = 'Hoorens'
      u.email = 'sebastien@citizenlab.co'
      u.password_digest = '$2a$10$npkXzpkkyO.g6LjmSYHbOeq76gxpOYeei8SVsjr0LqsBiAdTeDhHK'
      u.save
      expect(!!u.authenticate('supersecret')).to be(true)
      expect(u.password_digest).not_to eq('$2a$10$npkXzpkkyO.g6LjmSYHbOeq76gxpOYeei8SVsjr0LqsBiAdTeDhHK')
      expect(!!BCrypt::Password.new(u.password_digest).is_password?('supersecret')).to be(true)
      expect(!!u.authenticate('supersecret')).to be(true)
      expect(!!u.authenticate('totallywrong')).to be(false)
    end
  end

  describe 'email' do
    it 'is invalid if there is a case insensitive duplicate' do
      create(:user, email: 'KoEn@citizenlab.co')
      user = build(:user, email: 'kOeN@citizenlab.co')
      expect(user).to be_invalid
    end

    it 'is invalid if the domain is on our blacklist' do
      u1 = build(:user, email: 'xwrknecgyq_1542135485@039b1ee.netsolhost.com')
      expect(u1).to be_invalid
      expect(u1.errors.details[:email]).to eq [{ error: :domain_blacklisted, value: '039b1ee.netsolhost.com' }]
    end
  end

  describe 'password' do
    it 'is invalid when set to empty string' do
      u = build(:user, password: '')
      expect(u).to be_invalid
    end

    it 'is invalid if its a common password' do
      CommonPassword.initialize!
      u = build(:user, password: 'batman')
      expect(u).to be_invalid
    end

    it 'is valid when its a strong password' do
      u = build(:user, password: '9x6TUuzSfkzyQrQFhxN9')
      expect(u).to be_valid
    end

    it 'is valid when longer than minimum length' do
      settings = AppConfiguration.instance.settings
      settings['password_login'] = {
        'enabled' => true,
        'allowed' => true,
        'enable_signup' => true,
        'minimum_length' => 5,
        'phone' => false
      }
      AppConfiguration.instance.update! settings: settings

      u = build(:user, password: 'zen3F28')
      expect(u).to be_valid
    end

    it 'is invalid when shorter than minimum length' do
      settings = AppConfiguration.instance.settings
      settings['password_login'] = {
        'enabled' => true,
        'allowed' => true,
        'enable_signup' => true,
        'minimum_length' => 5,
        'phone' => false
      }
      AppConfiguration.instance.update! settings: settings

      u = build(:user, password: 'FetGaVW856')
      expect(u).to be_valid

      settings['password_login']['minimum_length'] = 12
      AppConfiguration.instance.update! settings: settings

      expect(u).to be_invalid
    end
  end

  describe 'bio sanitizer' do
    it 'sanitizes script tags in the body' do
      user = create(:user, bio_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(user.bio_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end
  end

  describe 'locale' do
    before do
      settings = AppConfiguration.instance.settings
      settings['core']['locales'] = %w[en nl-BE fr-FR]
      AppConfiguration.instance.update!(settings: settings)
    end

    it "is valid when it's one of the configured locales" do
      user = build(:user, locale: 'nl-BE')
      expect(user).to be_valid
    end

    it "is invalid when it's not one of the configured locales" do
      user = build(:user, locale: 'pt')
      expect { user.valid? }.to(change { user.errors[:locale] })
    end
  end

  describe 'slug' do
    it 'is generated on create when not given' do
      user = create(:user, slug: nil)
      expect(user.slug).to be_present
    end
  end

  describe 'avatar' do
    it "is blank generated when it's not specified" do
      user = build(:user, avatar: nil)
      user.save
      expect(user.avatar).to be_blank
    end
  end

  describe 'demographic fields' do
    before do
      create(:custom_field_birthyear)
      create(:custom_field_gender, :with_options)
      create(:custom_field_domicile)
      create(:custom_field_education, :with_options)
    end

    it '(gender) is valid when male, female or unspecified' do
      expect(build(:user, gender: 'male')).to be_valid
      expect(build(:user, gender: 'female')).to be_valid
      expect(build(:user, gender: 'unspecified')).to be_valid
    end

    it '(gender) is invalid when not male, female or unspecified' do
      user = build(:user, gender: 'somethingelse')
      expect { user.valid? }.to(change { user.errors[:gender] })
    end

    it '(birthyear) is valid when in realistic range' do
      expect(build(:user, birthyear: (Time.now.year - 117))).to be_valid
      expect(build(:user, birthyear: (Time.now.year - 13))).to be_valid
    end

    it '(birthyear) is invalid when unrealistic' do
      user = build(:user, birthyear: Time.now.year + 1)
      expect { user.valid? }.to(change { user.errors[:birthyear] })
      user = build(:user, birthyear: 1850)
      expect { user.valid? }.to(change { user.errors[:birthyear] })
      user = build(:user, birthyear: 'eighteen hundred')
      expect { user.valid? }.to(change { user.errors[:birthyear] })
    end

    it '(birthyear) is invalid when not an integer' do
      user = build(:user, birthyear: 'eighteen hundred')
      expect { user.valid? }.to(change { user.errors[:birthyear] })
      user = build(:user, birthyear: 1930.4)
      expect { user.valid? }.to(change { user.errors[:birthyear] })
    end

    it "(domicile) is valid when an area id or 'outside'" do
      create_list(:area, 5)
      expect(build(:user, domicile: Area.offset(rand(5)).first.id)).to be_valid
      expect(build(:user, domicile: 'outside')).to be_valid
    end

    it "(domicile) is invalid when not an area id or 'outside'" do
      user = build(:user, domicile: 'somethingelse')
      expect { user.valid? }.to(change { user.errors[:domicile] })
      user = build(:user, domicile: 5)
      expect { user.valid? }.to(change { user.errors[:domicile] })
    end

    it '(education) is valid when an ISCED2011 level' do
      CustomField.find_by(code: 'education').update(enabled: true)
      expect(build(:user, education: '2')).to be_valid
      expect(build(:user, education: '4')).to be_valid
      expect(build(:user, education: '8')).to be_valid
    end

    it '(education) is invalid when not an isced 2011 level' do
      CustomField.find_by(code: 'education').update(enabled: true)
      user = build(:user, education: 'somethingelse')
      expect { user.valid? }.to(change { user.errors[:education] })
      user = build(:user, education: 9)
      expect { user.valid? }.to(change { user.errors[:education] })
      user = build(:user, education: 2.4)
      expect { user.valid? }.to(change { user.errors[:education] })
    end
  end

  describe 'roles' do
    it 'is valid without roles' do
      u = build(:user, roles: [])
      expect(u).to be_valid
    end

    it 'is valid when the user is an admin' do
      u = build(:user, roles: [{ type: 'admin' }])
      expect(u).to be_valid
    end

    it 'is invalid when the user has an unknown role type' do
      u = build(:user, roles: [{ type: 'stonecarver' }])
      expect { u.valid? }.to(change { u.errors[:roles] })
    end

    it 'is valid when the user is a project moderator' do
      project = create(:project)
      u = build(:user, roles: [{ type: 'project_moderator', project_id: project.id }])
      expect(u).to be_valid
    end

    it 'is invalid when a project_moderator is missing a project_id' do
      u = build(:user, roles: [{ type: 'project_moderator' }])
      expect { u.valid? }.to(change { u.errors[:roles] })
    end

    it 'is valid when the user is a project_folder moderator' do
      project_folder = create(:project_folder)
      u = build(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: project_folder.id }])
      expect(u).to be_valid
    end

    it 'is invalid when a project_folder_moderator is missing a project_folder_id' do
      u = build(:user, roles: [{ type: 'project_folder_moderator' }])
      expect { u.valid? }.to(change { u.errors[:roles] })
    end
  end

  describe 'admin?' do
    it 'responds true when the user has the admin role' do
      u = build(:user, roles: [{ type: 'admin' }])
      expect(u.admin?).to be true
    end

    it 'responds false when the user does not have the admin role' do
      u = build(:user, roles: [])
      expect(u.admin?).to be false
    end
  end

  describe 'project_moderator?' do
    it 'responds false when the user does not have a project_moderator role' do
      l = create(:project)
      u = build(:user, roles: [])
      expect(u.project_moderator?(l.id)).to be false
    end

    it 'responds false when the user is not a project_moderator and no project_id is passed' do
      u = build(:admin)
      expect(u.project_moderator?).to be false
    end

    it 'responds true when the user has the project_moderator role' do
      l = create(:project)
      u = build(:user, roles: [{ type: 'project_moderator', project_id: l.id }])
      expect(u.project_moderator?(l.id)).to be true
    end

    it 'responds false when the user does not have a project_moderator role for the given project' do
      l1 = create(:project)
      l2 = create(:project)
      u = build(:user, roles: [{ type: 'project_moderator', project_id: l1.id }])
      expect(u.project_moderator?(l2.id)).to be false
    end

    it 'responds true when the user is project_moderator and no project_id is passed' do
      u = build(:user, roles: [{ type: 'project_moderator', project_id: 'project_id' }])
      expect(u.project_moderator?).to be true
    end
  end

  describe 'project_folder_moderator?' do
    it 'responds true when the user has the project_folder_moderator role' do
      l = create(:project_folder)
      u = build(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: l.id }])
      expect(u.project_folder_moderator?(l.id)).to be true
    end

    it 'responds false when the user does not have a project_folder_moderator role' do
      l = create(:project_folder)
      u = build(:user, roles: [])
      expect(u.project_folder_moderator?(l.id)).to be false
    end

    it 'responds false when the user does not have a project_folder_moderator role for the given project_folder' do
      l1 = create(:project_folder)
      l2 = create(:project_folder)
      u = build(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: l1.id }])
      expect(u.project_folder_moderator?(l2.id)).to be false
    end

    it 'response true when the user is project_folder_moderator and no project_folder_id is passed' do
      u = build(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: 'project_folder_id' }])
      expect(u.project_folder_moderator?).to be true
    end

    it 'response false when the user is not a project_folder_moderator and no project_folder_id is passed' do
      u = build(:admin)
      expect(u.project_folder_moderator?).to be false
    end
  end

  describe 'add_role' do
    it 'gives a user moderator rights for a project' do
      usr = create(:user, roles: [])
      prj = create(:project)
      expect(usr.project_moderator?(prj.id)).to be false

      usr.add_role 'project_moderator', project_id: prj.id
      expect(usr.save).to be true
      expect(usr.project_moderator?(prj.id)).to be true
      expect(usr.project_moderator?(create(:project).id)).to be false
    end
  end

  describe 'delete_role' do
    it 'denies a user from his admin rights' do
      admin = create(:admin)
      admin.delete_role('admin')

      aggregate_failures 'testing admin' do
        expect(admin).to be_valid
        expect(admin).not_to be_admin
      end
    end

    it 'denies a user from his moderator rights' do
      project = create :project
      moderator = create :project_moderator, projects: [project]

      moderator.delete_role 'project_moderator', project_id: project.id
      expect(moderator.save).to be true
      expect(moderator.project_moderator?(project.id)).to be false
    end
  end

  describe 'order_role' do
    before do
      10.times do |_i|
        create(rand(2) == 0 ? :admin : :user)
      end
    end

    it 'sorts from higher level roles to lower level roles by default' do
      serie = described_class.order_role.map { |u| u.roles.size }
      expect(serie).to eq serie.sort.reverse
    end

    it 'sorts from lower level roles to higher level roles with option asc' do
      serie = described_class.order_role(:desc).map { |u| u.roles.size }
      expect(serie).to eq serie.sort
    end
  end

  describe 'super_admin?' do
    it 'returns true for admins with various citizenlab email variations' do
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
        build_stubbed(:admin, email: 'hello+admin@CITIZENLAB.UK')
      ]

      expect(users).to all be_super_admin
    end

    it 'returns false for non-citizenlab emails' do
      strangers = [
        build_stubbed(:admin, email: 'hello@citizenlab.com'),
        build_stubbed(:admin, email: 'citizenlab.co@gmail.com'),
        build_stubbed(:admin)
      ]
      expect(strangers).not_to include(be_super_admin)
    end

    it 'returns false for non-admins' do
      user = build_stubbed(:user, email: 'hello@citizenlab.co')
      expect(user).not_to be_super_admin
    end
  end

  describe 'highest_role' do
    it 'correctly returns the highest role the user posesses' do
      expect(build_stubbed(:admin, email: 'hello@citizenlab.co').highest_role).to eq :super_admin
      expect(build_stubbed(:admin).highest_role).to eq :admin
      expect(build_stubbed(:user).highest_role).to eq :user
    end

    it 'correctly returns the highest role a moderator posesses' do
      expect(build_stubbed(:project_moderator).highest_role).to eq :project_moderator
    end
  end

  describe 'custom_field_values' do
    it 'validates when custom_field_values have changed' do
      u = create(:user)
      u.custom_field_values = {
        somekey: 'somevalue'
      }
      expect { u.save }.to(change { u.errors[:custom_field_values] })
    end

    it "doesn't validate when custom_field_values hasn't changed" do
      u = build(:user, custom_field_values: { somekey: 'somevalue' })
      u.save(validate: false)
      expect { u.save }.not_to(change { u.errors[:custom_field_values] })
    end
  end

  describe 'active?' do
    it 'returns false when the user has not completed signup' do
      u = build(:user, registration_completed_at: nil)
      expect(u.active?).to be false
    end

    it 'returns true when the user has completed signup' do
      u = build(:user)
      expect(u.active?).to be true
    end

    it 'returns false when the user is blocked' do
      u = build(:user, block_end_at: 5.days.from_now)
      expect(u.active?).to be false
    end
  end

  describe 'groups and group_ids' do
    let!(:manual_group) { create(:group) }
    let!(:group) { create(:group) }

    let(:user) { create(:user, manual_groups: [manual_group, group]) }

    it 'returns manual groups' do
      expect(user.groups).to match_array [manual_group, group]
      expect(user.group_ids).to match_array [manual_group.id, group.id]
    end
  end

  describe 'in_group' do
    it 'gets all users in a manual group' do
      group = create(:group)
      users = create_list(:user, 3, manual_groups: [group])
      create_list(:user, 2)
      expect(described_class.in_group(group).pluck(:id)).to match_array users.map(&:id)
    end
  end

  describe 'in_any_group' do
    it 'gets the union of all users in the given groups' do
      group1 = create(:group)
      group2 = create(:group)
      user1 = create(:user, email: 'jos@test.com', manual_groups: [group2])
      user2 = create(:user, email: 'jules@test.com', manual_groups: [group1])
      user4 = create(:user, manual_groups: [group2])

      expect(described_class.in_any_group([group1, group2])).to match_array [user1, user2, user4]
    end
  end

  describe 'in_any_groups?' do
    it 'returns truety iff the user is a member of one of the given groups' do
      group1, group2 = create_list(:group, 2)
      user = create(:user, manual_groups: [group1])
      expect(user.in_any_groups?(Group.none)).to be false
      expect(user.in_any_groups?(Group.where(id: group1))).to be true
      expect(user.in_any_groups?(Group.where(id: [group1, group2]))).to be true
      expect(user).not_to be_in_any_groups(Group.where(id: group2))
    end
  end

  describe '.find_by_cimail' do
    it 'finds a user with the same email but different caps' do
      some_user = create(:user, email: 'SeBi@citizenlab.co')
      same_user = described_class.find_by_cimail 'sEbI@citizenlab.co'

      expect(some_user.id).to eq same_user&.id
    end

    it 'returns nil if no user record with that email was found' do
      expect(described_class.find_by_cimail('doesnotexist@example.com')).to be_nil
    end
  end

  describe '.find_by_cimail!' do
    it 'finds a user with the same email but different caps' do
      some_user = create(:user, email: 'SeBi@citizenlab.co')
      same_user = described_class.find_by_cimail!('sEbI@citizenlab.co')

      expect(some_user.id).to eq(same_user.id)
    end

    it 'raises if no user record with that email was found' do
      expect { described_class.find_by_cimail!('doesnotexist@example.com') }
        .to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  context 'user confirmation' do
    subject(:user) { build(:user_with_confirmation) }

    after do
      user.clear_changes_information
    end

    before do
      SettingsService.new.activate_feature! 'user_confirmation'
    end

    it 'is initialized without a confirmation code' do
      expect(user.email_confirmation_code).to be_nil
    end

    describe '#confirmed?' do
      it 'returns false when the user has not yet confirmed their account' do
        user.save!
        expect(user.confirmed?).to be false
      end

      it 'returns true after the user has confirmed their account' do
        user.save!
        user.confirm!
        expect(user.reload.confirmed?).to be true
      end

      it 'returns true if the user accepted an invitation' do
        user.update(invite_status: 'accepted')
        expect(user.confirmed?).to be true
      end
    end

    describe '#should_require_confirmation?' do
      it 'returns false if the user is an admin' do
        user.add_role('admin')
        user.save!
        expect(user.should_require_confirmation?).to be false
      end

      it 'returns false if the user is a project moderator', skip: !defined?(ProjectManagement::Engine) do
        user.add_role('project_moderator', 'project_id' => 'some_id')
        user.save!
        expect(user.should_require_confirmation?).to be false
      end

      it 'returns false if the user is a normal user' do
        expect(user.should_require_confirmation?).to be true
      end

      it 'returns false if the user registered with a phone number' do
        enable_phone_login
        user.email = '343938837373'
        user.save!
        expect(user.reload.should_require_confirmation?).to be false
      end
    end

    describe '#confirmation_required?' do
      it 'returns false if the feature is not active' do
        SettingsService.new.deactivate_feature! 'user_confirmation'
        expect(user.confirmation_required?).to be false
      end

      it 'returns false if the user already confirmed their account' do
        SettingsService.new.activate_feature! 'user_confirmation'
        user.save!
        user.confirm!
        expect(user.reload.confirmation_required?).to be false
      end

      it 'returns true if the user has not yet confirmed their account' do
        expect(user.confirmation_required?).to be true
      end
    end

    describe '#confirmation_required' do
      it 'raises a private method error' do
        expect { user.confirmation_required }.to raise_error NoMethodError
      end
    end

    describe '#confirmation_required=' do
      it 'raises a private method error' do
        expect { user.confirmation_required = false }.to raise_error NoMethodError
      end
    end

    describe '#reset_confirmation_required' do
      it 'resets the confirmation required field' do
        user.save!
        user.reset_confirmation_required
        expect(user.confirmation_required?).to be true
      end

      it 'does not perform a commit to the db' do
        user.save!
        user.reset_confirmation_required
        expect(user.saved_change_to_confirmation_required?).to be false
      end
    end

    describe '#confirm' do
      it 'sets the email_confirmed_at field' do
        user.save!
        user.confirm
        expect(user.confirmed?).to be true
      end

      it 'does not perform a commit to the db' do
        user.save!
        user.confirm
        expect(user.reload.confirmed?).to be false
      end
    end

    describe '#reset_confirmed_at' do
      it 'resets the confirmed_at field' do
        user.confirm!
        user.reset_confirmed_at
        expect(user.confirmed?).to be false
      end

      it 'does not perform a commit to the db' do
        user.confirm!
        user.reset_confirmed_at
        expect(user.saved_change_to_confirmation_required?).to be false
      end
    end

    describe '#reset_confirmation_code!' do
      it 'changes the code' do
        expect { user.reset_confirmation_code! }.to change(user, :email_confirmation_code)
      end

      it 'increments the reset count' do
        expect { user.reset_confirmation_code! }.to change(user, :email_confirmation_code_reset_count).from(0).to(1)
      end

      it 'should save a change to the email confirmation code' do
        expect { user.reset_confirmation_code! }.to change(user, :saved_change_to_email_confirmation_code?)
      end
    end

    describe '#increment_confirmation_retry_count!' do
      it 'increments the retry count' do
        expect { user.increment_confirmation_retry_count! }.to change(user, :email_confirmation_retry_count).from(0).to(1)
      end

      it 'saved the change to the retry count' do
        expect { user.increment_confirmation_retry_count! }.to change(user, :saved_change_to_email_confirmation_retry_count?)
      end
    end

    describe '#increment_confirmation_code_reset_count!' do
      it 'increments the reset count' do
        expect { user.reset_confirmation_code! }.to change(user, :email_confirmation_code_reset_count).from(0).to(1)
      end

      it 'saved the change to the reset count' do
        expect { user.reset_confirmation_code! }.to change(user, :saved_change_to_email_confirmation_code_reset_count?)
      end
    end

    describe '#reset_confirmation_code' do
      it 'changes the code' do
        expect { user.reset_confirmation_code }.to change(user, :email_confirmation_code)
        expect(user.email_confirmation_code).to match(USER_CONFIRMATION_CODE_PATTERN)
      end

      it 'should not save a change to the email confirmation code' do
        expect { user.reset_confirmation_code }.not_to change(user, :saved_change_to_email_confirmation_code?)
      end
    end

    describe '#increment_confirmation_code_reset_count' do
      it 'increments the reset count' do
        expect { user.increment_confirmation_code_reset_count }.to change(user, :email_confirmation_code_reset_count).from(0).to(1)
      end

      it 'should not save the change to the reset count' do
        expect { user.increment_confirmation_code_reset_count }.not_to change(user, :saved_change_to_email_confirmation_code_reset_count?)
      end
    end

    describe '#increment_confirmation_retry_count' do
      it 'increments the retry count' do
        expect { user.increment_confirmation_retry_count }.to change(user, :email_confirmation_retry_count).from(0).to(1)
      end

      it 'should not save the change to the retry count' do
        expect { user.increment_confirmation_retry_count }.not_to change(user, :saved_change_to_email_confirmation_retry_count?)
      end
    end

    describe '#reset_email!' do
      let(:email) { 'new_email@email.com' }

      it 'changes the email' do
        expect { user.reset_email!(email) }.to change(user, :email).from(user.email).to(email)
      end

      it 'resets the confirmation code reset count' do
        user.increment_confirmation_code_reset_count!
        user.reload
        expect { user.reset_email!(email) }.to change(user, :email_confirmation_code_reset_count).from(1).to(0)
      end

      it 'saves the change to the email' do
        expect { user.reset_email!(email) }.to change(user, :saved_change_to_email)
      end

      it 'should save the change to the code reset count' do
        user.increment_confirmation_code_reset_count!
        user.reload
        expect { user.reset_email!(email) }.to change(user, :saved_change_to_email_confirmation_code_reset_count?)
      end
    end

    describe '#confirm!' do
      it 'should set email confirmed at' do
        user.save!
        expect { user.confirm! }.to change(user, :saved_change_to_email_confirmed_at?)
      end
    end
  end
end
