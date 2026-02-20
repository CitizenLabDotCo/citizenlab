# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:user)).to be_valid
    end
  end

  describe 'associations' do
    subject(:user) { build(:user) }

    it { is_expected.to have_many(:ideas).dependent(:nullify) }
    it { is_expected.to have_many(:idea_imports).dependent(:nullify) }
    it { is_expected.to have_many(:comments).dependent(:nullify) }
    it { is_expected.to have_many(:internal_comments).dependent(:nullify) }
    it { is_expected.to have_many(:official_feedbacks).dependent(:nullify) }
    it { is_expected.to have_many(:reactions).dependent(:nullify) }
    it { is_expected.to have_many(:event_attendances).class_name('Events::Attendance').dependent(:destroy) }
    it { is_expected.to have_many(:attended_events).through(:event_attendances).source(:event) }
    it { is_expected.to have_many(:requested_project_reviews).class_name('ProjectReview').with_foreign_key('requester_id').dependent(:nullify) }
    it { is_expected.to have_many(:assigned_project_reviews).class_name('ProjectReview').with_foreign_key('reviewer_id').dependent(:nullify) }
    it { is_expected.to have_many(:jobs_trackers).class_name('Jobs::Tracker').with_foreign_key('owner_id').dependent(:nullify) }
    it { is_expected.to have_many(:files).class_name('Files::File').with_foreign_key('uploader_id').dependent(:nullify) }
    it { is_expected.to have_many(:claim_tokens).with_foreign_key('pending_claimer_id').dependent(:destroy) }
    it { is_expected.to have_many(:idea_exposures).dependent(:destroy) }

    it 'nullifies idea import association' do
      idea_import = create(:idea_import, import_user: user)
      expect { user.destroy }.not_to raise_error
      expect(idea_import.reload.import_user).to be_nil
    end

    it 'nullifies manual_votes_last_updated_by association' do
      idea = create(:idea, manual_votes_last_updated_by: user)
      expect { user.destroy }.not_to raise_error
      expect(idea.reload.manual_votes_last_updated_by).to be_nil
    end

    it 'nullifies manual_voters_last_updated_by association' do
      phase = create(:phase, manual_voters_last_updated_by: user)
      expect { user.destroy }.not_to raise_error
      expect(phase.reload.manual_voters_last_updated_by).to be_nil
    end

    it 'destroys idea_exposures when user is deleted' do
      user.save!
      phase = create(:phase)
      idea = create(:idea, phases: [phase])
      idea_exposure = create(:idea_exposure, user: user, idea: idea, phase: phase)
      expect { user.destroy }.not_to raise_error
      expect { idea_exposure.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe '.destroy_all_async' do
    before_all { create_list(:user, 2) }

    it 'enqueues a user-deletion job for each user by default' do
      expect { described_class.destroy_all_async }
        .to have_enqueued_job(DeleteUserJob).exactly(described_class.count).times
    end

    it 'enqueues a user-deletion job for each user in the given scope' do
      scope = described_class.where(id: described_class.first.id)
      expect { described_class.destroy_all_async(scope) }
        .to have_enqueued_job(DeleteUserJob).exactly(scope.count).times
    end
  end

  describe 'generate_slug' do
    let(:user) { build(:user) }

    it 'generates a slug based on the first and last name' do
      user.update!(first_name: 'Not Really_%40)', last_name: '286^$@sluggable')
      expect(user.slug).to eq 'not-really-40-286-sluggable'
    end

    it 'does not generate a slug if an invited user' do
      invitee = create(:invited_user, first_name: nil, last_name: nil)
      expect(invitee.slug).to be_nil
    end
  end

  describe 'creating an invited user' do
    it 'has correct linking between invite and invitee' do
      invitee = create(:invited_user)
      expect(invitee.invitee_invite.invitee.id).to eq invitee.id
    end
  end

  describe 'creating a light user - email & locale only' do
    it 'is valid' do
      SettingsService.new.activate_feature! 'user_confirmation'
      u = described_class.new(email: 'test@test.com', locale: 'en')
      u.save!
      expect(u).to be_valid
    end

    it 'is still valid if user confirmation is not turned on' do
      u = described_class.new(email: 'test@test.com', locale: 'en')
      u.save
      expect(u).to be_valid
    end
  end

  describe '.after_initialize' do
    it "stores new user's role" do
      user = build(:user)
      user.roles = [{ 'type' => 'admin' }]
      expect(user.highest_role_after_initialize).to eq(:user)
    end

    it "stores existing user's role" do
      create(:admin)
      user = described_class.first
      user.roles = [{ 'type' => 'project_moderator', 'project_id' => 1 }]
      expect(user.highest_role_after_initialize).to eq(:admin)
    end

    it 'does not store role if roles attributes is not loaded by AR' do
      create(:admin)
      user = described_class.select(:id).first
      expect(user.highest_role_after_initialize).to be_nil
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

    it 'Only blocked users should be returned in scope :blocked' do
      blocked_users = described_class.all.blocked

      expect(blocked_users.count).to eq 2
      expect(blocked_users).to contain_exactly(user1, user3)
      expect(blocked_users).not_to include(user2)
    end
  end

  describe 'authentication without password' do
    context 'when user_confirmation feature is active' do
      before do
        SettingsService.new.activate_feature! 'user_confirmation'
      end

      it 'is allowed if the user has no password and confirmation is required' do
        u = described_class.new(email: 'bob@citizenlab.co')
        expect(!!u.authenticate('')).to be(true)
      end

      it 'is not allowed if a password has been supplied in the request' do
        u = described_class.new(email: 'bob@citizenlab.co')
        expect(!!u.authenticate('any_string')).to be(false)
      end

      it 'is not allowed if a password has been set' do
        u = described_class.new(email: 'bob@citizenlab.co', password: 'democracy2.0')
        expect(!!u.authenticate('')).to be(false)
      end

      it 'is not allowed if confirmation is not required' do
        u = described_class.new(email: 'bob@citizenlab.co')
        u.confirm
        expect(!!u.authenticate('')).to be(false)
      end
    end

    context 'when user_confirmation feature is not active' do
      before do
        SettingsService.new.deactivate_feature! 'user_confirmation'
      end

      it 'is not allowed if no password has been set and confirmation is required' do
        u = described_class.new(email: 'bob@citizenlab.co')
        expect(!!u.authenticate('')).to be(false)
        expect(!!u.authenticate('any_string')).to be(false)
      end

      it 'is not allowed if a password has been set' do
        u = described_class.new(email: 'bob@citizenlab.co', password: 'democracy2.0')
        expect(!!u.authenticate('')).to be(false)
      end

      it 'is not allowed if confirmation is not required' do
        u = described_class.new(email: 'bob@citizenlab.co')
        u.confirm
        expect(!!u.authenticate('')).to be(false)
      end
    end
  end

  describe 'email' do
    it 'is invalid if there is a case insensitive duplicate' do
      create(:user, email: 'KoEn@citizenlab.co')
      user = build(:user, email: 'kOeN@citizenlab.co')
      expect(user).to be_invalid
    end

    it 'is invalid when new record and the domain is on our blacklist' do
      u1 = build(:user, email: 'xwrknecgyq_1542135485@039b1ee.netsolhost.com')
      expect(u1).to be_invalid

      # We mildly obfuscate the error message to make a spammers life a little more difficult,
      # especially avoiding leaking info about which domains are blacklisted.
      expect(u1.errors.details[:email]).to eq [{ error: 'something_went_wrong', code: 'zrb-42' }]
    end

    it 'is invalid when existing record and the domain is updated to a domain on our blacklist' do
      user = create(:user, email: 'allowed@domain.com')
      user.email = 'blocked@039b1ee.netsolhost.com'

      expect(user).to be_invalid
      expect(user.errors.details[:email]).to eq [{ error: 'something_went_wrong', code: 'zrb-42' }]
    end

    # We avoid invalidating users who had a now-blocked email domain before it was blocked
    it 'is valid if domain is on our blacklist but are updating other user attributes' do
      user = create(:user)
      user.update_column(:email, 'blocked@039b1ee.netsolhost.com') # bypasses validations

      user.first_name = 'UpdatedName'
      expect(user).to be_valid
    end

    it 'is valid if domain is on our blacklist but also on our whitelist' do
      common_spam_domains = Rails.root.join('config/common_spam_domains.txt').readlines.map { |x| x.strip.downcase }
      expect(common_spam_domains).to include('yopmail.com')
      expect(EmailDomainBlacklist::WHITELISTED_DOMAINS).to include('yopmail.com')

      user = build(:user, email: 'someone@yopmail.com')
      expect(user).to be_valid
    end

    it 'is invalid when new record and the email is banned' do
      EmailBan.ban!('banned.user+test@gmail.com')
      user = build(:user, email: 'banneduser@gmail.com') # normalized match

      expect(user).to be_invalid
      expect(user.errors.details[:email]).to eq [{ error: 'something_went_wrong', code: 'zrb-43' }]
    end

    it 'is invalid when existing record and the email is updated to a banned email' do
      EmailBan.ban!('banned@example.com')
      user = create(:user, email: 'allowed@domain.com')
      user.email = 'banned@example.com'

      expect(user).to be_invalid
      expect(user.errors.details[:email]).to eq [{ error: 'something_went_wrong', code: 'zrb-43' }]
    end

    it 'is valid if email is banned but are updating other user attributes' do
      user = create(:user)
      user.update_column(:email, 'now_banned@example.com') # bypasses validations
      EmailBan.ban!('now_banned@example.com')

      user.first_name = 'UpdatedName'
      expect(user).to be_valid
    end

    it 'is required when a unique code is not present' do
      u1 = build(:user, email: nil)
      expect(u1).to be_invalid
    end

    it 'is not required when a unique code is present' do
      u1 = build(:user, email: nil, unique_code: '1234abcd')
      expect(u1).to be_valid
    end
  end

  describe 'new_email' do
    it 'is invalid when new record and the domain is on our blacklist' do
      user = build(:user, new_email: 'xwrknecgyq_1542135485@039b1ee.netsolhost.com')
      expect(user).to be_invalid

      # We mildly obfuscate the error message to make a spammers life a little more difficult,
      # especially avoiding leaking info about which domains are blacklisted.
      expect(user.errors.details[:new_email]).to eq [{ error: 'something_went_wrong', code: 'zrb-42' }]
    end

    it 'is invalid when existing record and the domain is updated to a domain on our blacklist' do
      user = create(:user, new_email: 'allowed@domain.com')
      user.new_email = 'blocked@039b1ee.netsolhost.com'

      expect(user).to be_invalid
      expect(user.errors.details[:new_email]).to eq [{ error: 'something_went_wrong', code: 'zrb-42' }]
    end

    # We avoid invalidating users who had a now-blocked email domain before it was blocked
    it 'is valid if domain is on our blacklist but are updating other user attributes' do
      user = create(:user)
      user.update_column(:new_email, 'blocked@039b1ee.netsolhost.com') # bypasses validations

      user.first_name = 'UpdatedName'
      expect(user).to be_valid
    end

    it 'is valid if domain is on our blacklist but also on our whitelist' do
      common_spam_domains = Rails.root.join('config/common_spam_domains.txt').readlines.map { |x| x.strip.downcase }
      expect(common_spam_domains).to include('yopmail.com')
      expect(EmailDomainBlacklist::WHITELISTED_DOMAINS).to include('yopmail.com')

      user = build(:user, new_email: 'someone@yopmail.com')
      expect(user).to be_valid
    end

    it 'is invalid when the new_email is banned' do
      EmailBan.ban!('banned.user+test@gmail.com')
      user = build(:user, new_email: 'banneduser@gmail.com') # normalized match

      expect(user).to be_invalid
      expect(user.errors.details[:new_email]).to eq [{ error: 'something_went_wrong', code: 'zrb-43' }]
    end

    it 'is valid if new_email is banned but are updating other user attributes' do
      user = create(:user)
      user.update_column(:new_email, 'now_banned@example.com') # bypasses validations
      EmailBan.ban!('now_banned@example.com')

      user.first_name = 'UpdatedName'
      expect(user).to be_valid
    end

    it 'is invalid email if the new email is not a valid email' do
      user = build(:user, new_email: 'test_test.com')
      expect(user).to be_invalid
      expect(user.errors.details[:new_email]).not_to be_present
      expect(user.errors.details[:email]).to eq [{ error: :invalid, value: 'test_test.com' }]
    end

    it 'is invalid email if there is a case insensitive duplicate of the new email' do
      create(:user, email: 'KoEn@citizenlab.co')
      user = build(:user, new_email: 'kOeN@citizenlab.co')
      expect(user).to be_invalid
      expect(user.errors.details[:new_email]).not_to be_present
      expect(user.errors.details[:email]).to eq [{ error: :taken, value: 'kOeN@citizenlab.co' }]
    end
  end

  describe 'unique_code' do
    it 'returns an error if it already exists' do
      create(:user, unique_code: '1234abcd')
      expect { create(:user, unique_code: '1234abcd') }.to raise_error(ActiveRecord::RecordNotUnique)
    end
  end

  describe 'password' do
    context 'user confirmation is turned on' do
      it 'is valid when not supplied at all' do
        # This is allowed to allow accounts without a password
        SettingsService.new.activate_feature! 'user_confirmation'
        u = build(:user_no_password)
        expect(u).to be_valid
      end
    end

    context 'user confirmation is turned off' do
      it 'is still valid when not supplied' do
        u = build(:user_no_password)
        expect(u).to be_valid
      end
    end

    it 'is valid when set to empty string' do
      u = build(:user, password: '')
      expect(u).to be_valid
    end

    it 'is valid when nil' do
      u = build(:user, password: nil)
      expect(u).to be_valid
    end

    it 'does not create a password digest if the password is empty' do
      u = build(:user, password: '')
      expect(u.password_digest).to be_nil
    end

    it 'does not create a password digest if the password is nil' do
      u = build(:user, password: nil)
      expect(u.password_digest).to be_nil
    end

    it 'is invalid if its a common password' do
      CommonPassword.initialize!
      u = build(:user, password: 'password123')
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
        'minimum_length' => 5
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
        'minimum_length' => 5
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

    it 'responds true when the user is project_folder_moderator and no project_folder_id is passed' do
      u = build(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: 'project_folder_id' }])
      expect(u.project_folder_moderator?).to be true
    end

    it 'responds false when the user is not a project_folder_moderator and no project_folder_id is passed' do
      u = build(:admin)
      expect(u.project_folder_moderator?).to be false
    end
  end

  describe 'project_or_folder_moderator?' do
    it 'responds true when the user has the project_folder_moderator role' do
      u = build(:user, roles: [{ type: 'project_folder_moderator', project_folder_id: 'project_folder_id' }])
      expect(u.project_or_folder_moderator?).to be true
    end

    it 'responds true when the user is project_moderator' do
      u = build(:user, roles: [{ type: 'project_moderator', project_id: 'project_id' }])
      expect(u.project_or_folder_moderator?).to be true
    end

    it 'responds false when the user does not have any moderator roles' do
      u = build(:user, roles: [])
      expect(u.project_or_folder_moderator?).to be false
    end
  end

  describe 'moderator scopes' do
    let(:user) { create(:user) }
    let(:admin) { create(:admin) }
    let!(:project) { create(:project) }
    let!(:project_folder) { create(:project_folder, projects: [project]) }
    let(:project_moderator) { create(:project_moderator, projects: [project]) }
    let(:moderator_of_other_project) { create(:project_moderator, projects: [create(:project)]) }
    let(:project_folder_moderator) { create(:project_folder_moderator, project_folders: [project_folder]) }
    let(:moderator_of_other_folder) { create(:project_folder_moderator, project_folders: [create(:project_folder)]) }

    describe '.project_moderator' do
      context 'when a project ID is provided' do
        it 'excludes regular user with no roles' do
          expect(described_class.project_moderator(project.id)).not_to include(user)
        end

        it 'excludes admins' do
          expect(described_class.project_moderator(project.id)).not_to include(admin)
        end

        it 'includes project moderators of project' do
          expect(described_class.project_moderator(project.id)).to include(project_moderator)
        end

        it 'excludes project moderators of other projects' do
          expect(described_class.project_moderator(project.id)).not_to include(moderator_of_other_project)
        end

        it 'excludes folder moderators of project folder' do
          expect(described_class.project_moderator(project.id)).not_to include(project_folder_moderator)
        end

        it 'excludes folder moderators of other folders' do
          expect(described_class.project_moderator(project.id)).not_to include(moderator_of_other_folder)
        end
      end

      context 'when a project ID is not provided' do
        it 'includes only users with a project moderator role' do
          expect(described_class.project_moderator)
            .to contain_exactly(project_moderator, moderator_of_other_project)
        end
      end
    end

    describe '.project_folder_moderator' do
      context 'when one folder ID is provided' do
        it 'excludes regular user with no roles' do
          expect(described_class.project_folder_moderator(project_folder.id)).not_to include(user)
        end

        it 'excludes admins' do
          expect(described_class.project_folder_moderator(project_folder.id)).not_to include(admin)
        end

        it 'includes folder moderators of folder' do
          expect(described_class.project_folder_moderator(project_folder.id)).to include(project_folder_moderator)
        end

        it 'excludes folder moderators of folder' do
          expect(described_class.project_folder_moderator(project_folder.id)).not_to include(moderator_of_other_folder)
        end

        it 'excludes project moderators who are not also moderator of the folder' do
          expect(described_class.project_folder_moderator(project_folder.id)).not_to include(project_moderator)
          expect(described_class.project_folder_moderator(project_folder.id)).not_to include(moderator_of_other_project)
        end

        it 'includes project moderators who are also moderator of the folder' do
          moderator_of_other_project.roles << { type: 'project_folder_moderator', project_folder_id: project_folder.id }
          moderator_of_other_project.save!

          expect(described_class.project_folder_moderator(project_folder.id)).to include(moderator_of_other_project)
        end
      end

      context 'when multiple folder IDs are provided' do
        it 'works as an AND filter' do
          # Create user who is a moderator of both folders
          user = create(:user)
          another_folder = create(:project_folder)
          user.roles << { type: 'project_folder_moderator', project_folder_id: project_folder.id }
          user.roles << { type: 'project_moderator', project_id: create(:project).id }
          user.roles << { type: 'project_folder_moderator', project_folder_id: another_folder.id }
          user.save!

          # Create user who is moderator of only one folder
          user_with_only_one_folder = create(:user)
          user_with_only_one_folder.roles << { type: 'project_folder_moderator', project_folder_id: another_folder.id }
          user_with_only_one_folder.save!

          expect(described_class.project_folder_moderator(project_folder.id, another_folder.id)).to include(user)
          expect(described_class.project_folder_moderator(project_folder.id, another_folder.id)).not_to include(user_with_only_one_folder)
        end
      end

      context 'when no folder ID is not provided' do
        it 'includes only users with a folder moderator role' do
          expect(described_class.project_folder_moderator)
            .to contain_exactly(project_folder_moderator, moderator_of_other_folder)
        end
      end
    end

    describe '.not_project_moderator' do
      context 'when a project ID is provided' do
        it 'includes regular user with no roles' do
          expect(described_class.not_project_moderator(project.id)).to include(user)
        end

        it 'includes admins' do
          expect(described_class.not_project_moderator(project.id)).to include(admin)
        end

        it 'excludes project moderators of project' do
          expect(described_class.not_project_moderator(project.id)).not_to include(project_moderator)
        end

        it 'includes project moderators of other projects' do
          expect(described_class.not_project_moderator(project.id)).to include(moderator_of_other_project)
        end

        it 'excludes folder moderators of project folder' do
          expect(described_class.not_project_moderator(project.id)).not_to include(project_folder_moderator)
        end

        it 'includes folder moderators of other folders' do
          expect(described_class.not_project_moderator(project.id)).to include(moderator_of_other_folder)
        end
      end

      context 'when a project ID is not provided' do
        it 'includes only users without a project moderator role' do
          expect(described_class.not_project_moderator)
            .to contain_exactly(user, admin, project_folder_moderator, moderator_of_other_folder)
        end
      end
    end

    describe '.not_project_folder_moderator' do
      context 'when a folder ID is provided' do
        it 'includes regular user with no roles' do
          expect(described_class.not_project_folder_moderator(project_folder.id)).to include(user)
        end

        it 'includes admins' do
          expect(described_class.not_project_folder_moderator(project_folder.id)).to include(admin)
        end

        it 'excludes folder moderators of folder' do
          expect(described_class.not_project_folder_moderator(project_folder.id))
            .not_to include(project_folder_moderator)
        end

        it 'includes folder moderators of other folders' do
          expect(described_class.not_project_folder_moderator(project_folder.id)).to include(moderator_of_other_folder)
        end

        it 'includes project moderators of projects in folder' do
          expect(described_class.not_project_folder_moderator(project_folder.id)).to include(project_moderator)
        end

        it 'includes project moderators of projects not in folder' do
          expect(described_class.not_project_folder_moderator(project_folder.id))
            .to include(moderator_of_other_project)
        end
      end

      context 'when a folder ID is not provided' do
        it 'includes only users without a folder moderator role' do
          expect(described_class.not_project_folder_moderator)
            .to contain_exactly(user, admin, project_moderator, moderator_of_other_project)
        end
      end
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
      project = create(:project)
      moderator = create(:project_moderator, projects: [project])

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
    it 'returns true for admins with various Go Vocal and Citizenlab email variations' do
      users = [
        build_stubbed(:admin, email: 'hello@citizenlab.co'),
        build_stubbed(:admin, email: 'hello+admin@citizenLab.co'),
        build_stubbed(:admin, email: 'hello@citizenlab.eu'),
        build_stubbed(:admin, email: 'moderator+admin@citizenlab.be'),
        build_stubbed(:admin, email: 'cheese.lover@CitizenLab.ch'),
        build_stubbed(:admin, email: 'Fritz+Wurst@Citizenlab.de'),
        build_stubbed(:admin, email: 'breek.nou.mijn.klomp@citizenlab.NL'),
        build_stubbed(:admin, email: 'bigger@citizenlab.us'),
        build_stubbed(:admin, email: 'magdalena@citizenlab.cl'),
        build_stubbed(:admin, email: 'hello+admin@CITIZENLAB.UK'),
        build_stubbed(:admin, email: 'hello@govocal.com'),
        build_stubbed(:admin, email: 'hello+admin@govocal.com'),
        build_stubbed(:admin, email: 'hello@govocal.eu'),
        build_stubbed(:admin, email: 'moderator+admin@govocal.be'),
        build_stubbed(:admin, email: 'cheese.lover@Govocal.ch'),
        build_stubbed(:admin, email: 'Fritz+Wurst@Govocal.de'),
        build_stubbed(:admin, email: 'breek.nou.mijn.klomp@govocal.NL'),
        build_stubbed(:admin, email: 'bigger@govocal.us'),
        build_stubbed(:admin, email: 'magdalena@govocal.cl'),
        build_stubbed(:admin, email: 'hello+admin@GOVOCAL.UK')
      ]

      expect(users).to all be_super_admin
    end

    it 'returns false for non-Go Vocal emails' do
      strangers = [
        build_stubbed(:admin, email: 'hello@citizenlab.com'),
        build_stubbed(:admin, email: 'citizenlab.co@gmail.com'),
        build_stubbed(:admin, email: 'govocal.com@gmail.com'),
        build_stubbed(:admin)
      ]
      expect(strangers).not_to include(be_super_admin)
    end

    it 'returns false for non-admins' do
      user = build_stubbed(:user, email: 'hello@govocal.com')
      expect(user).not_to be_super_admin
    end
  end

  describe 'highest_role' do
    it 'correctly returns the highest role the user posesses' do
      expect(build_stubbed(:admin, email: 'hello@govocal.com').highest_role).to eq :super_admin
      expect(build_stubbed(:admin).highest_role).to eq :admin
      expect(build_stubbed(:user).highest_role).to eq :user
    end

    it 'correctly returns the highest role a moderator posesses' do
      expect(build_stubbed(:project_moderator).highest_role).to eq :project_moderator
    end
  end

  describe 'onboarding' do
    it 'is valid when empty' do
      u = build(:user, onboarding: {})
      expect(u).to be_valid
    end

    it 'is valid when topics are satisfied' do
      u = build(:user, onboarding: { topics_and_areas: 'satisfied' })
      expect(u).to be_valid
    end

    it 'is invalid when the key is not valid' do
      u = build(:user, onboarding: { bananas: 'satisfied' })
      expect(u).to be_invalid
    end

    it 'is invalid when the value is not valid' do
      u = build(:user, onboarding: { topics_and_areas: 'bananas' })
      expect(u).to be_invalid
    end
  end

  describe 'custom_field_values' do
    # TODO: Allow light users without required fields
    # it 'validates when custom_field_values have changed' do
    #   u = create(:user)
    #   u.custom_field_values = {
    #     somekey: 'somevalue'
    #   }
    #   expect { u.save }.to(change { u.errors[:custom_field_values] })
    # end

    it "doesn't validate on creation without form submission" do
      u = build(:user, custom_field_values: { somekey: 'somevalue' })
      expect { u.save }.not_to(change { u.errors[:custom_field_values] })
    end

    it 'validates on form submission' do
      u = build(:user, custom_field_values: { somekey: 'somevalue' })
      expect { u.save(context: :form_submission) }.to(change { u.errors[:custom_field_values] })
    end
  end

  describe 'registered?' do
    it 'returns false when the user has not completed registration' do
      u = build(:user, registration_completed_at: nil)
      expect(u.registered?).to be false
    end

    it 'returns true when the user has completed registration' do
      u = build(:user)
      expect(u.registered?).to be true
    end
  end

  describe 'active?' do
    it 'returns true when the user has completed signup' do
      u = build(:user)
      expect(u.active?).to be true
    end

    it 'returns false when the user has not completed signup' do
      u = build(:user, registration_completed_at: nil)
      expect(u.active?).to be false
    end

    it 'returns false when the user requires confirmation' do
      SettingsService.new.activate_feature! 'user_confirmation'
      u = build(:user)
      expect(u.active?).to be false
    end

    it 'returns false when the user is blocked' do
      u = build(:user, block_end_at: 5.days.from_now)
      expect(u.active?).to be false
    end
  end

  describe 'registration_completed_at' do
    context 'without user confirmation turned on' do
      it 'is set when user is created' do
        u = create(:user)
        expect(u.registration_completed_at).not_to be_nil
      end

      it 'is not set when an invited user is created' do
        u = create(:invited_user)
        expect(u.registration_completed_at).to be_nil
      end

      it 'is set when an invited user is accepted' do
        u = create(:invited_user)
        u.update!(invite_status: 'accepted')
        expect(u.registration_completed_at).not_to be_nil
      end

      it 'is set to the value provided if a value is provided in update' do
        reg_date = Time.now
        u = create(:user)
        u.update!(registration_completed_at: reg_date)
        expect(u.registration_completed_at.to_i).to eq reg_date.to_i
      end
    end

    context 'with user confirmation turned on' do
      before do
        SettingsService.new.activate_feature! 'user_confirmation'
      end

      it 'is not set when a user is created' do
        u = create(:user_with_confirmation)
        expect(u.registration_completed_at).to be_nil
      end

      it 'is set when a user is confirmed' do
        u = create(:user_with_confirmation)
        u.confirm!
        expect(u.registration_completed_at).not_to be_nil
      end

      it 'is set when an invited user accepts the invite' do
        u = create(:invited_user)
        u.update!(invite_status: 'accepted')
        expect(u.registration_completed_at).not_to be_nil
      end

      it 'is set when an SSO user is created' do
        u = create(:user)
        facebook_identity = create(:facebook_identity)
        u.identities << facebook_identity
        expect(u.registration_completed_at).not_to be_nil
      end
    end
  end

  describe 'groups and group_ids' do
    let!(:manual_group) { create(:group) }
    let!(:group) { create(:group) }

    let(:user) { create(:user, manual_groups: [manual_group, group]) }

    it 'returns manual groups' do
      expect(user.groups).to contain_exactly(manual_group, group)
      expect(user.group_ids).to contain_exactly(manual_group.id, group.id)
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

      expect(described_class.in_any_group([group1, group2])).to contain_exactly(user1, user2, user4)
    end
  end

  describe 'in_any_groups?' do
    it 'returns true if the user is a member of one of the given groups' do
      group1, group2 = create_list(:group, 2)
      user = create(:user, manual_groups: [group1])
      expect(user.in_any_groups?(Group.none)).to be false
      expect(user.in_any_groups?(Group.where(id: group1))).to be true
      expect(user.in_any_groups?(Group.where(id: [group1, group2]))).to be true
      expect(user).not_to be_in_any_groups(Group.where(id: group2))
    end

    it 'returns false if the user is not in any groups' do
      group = create(:group)
      user = create(:user)
      expect(user.in_any_groups?([group])).to be false
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

      it 'returns false when the user is a verified SSO user with no email' do
        u = build(:user, identities: [build(:franceconnect_identity)], email: nil, verified: true)
        expect(u.confirmation_required?).to be false
      end

      it 'returns true when the user is an unverified SSO user with no email' do
        u = build(:user, identities: [build(:facebook_identity)], email: nil)
        expect(u.confirmation_required?).to be true
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

    describe '#set_confirmation_required' do
      it 'does not perform a commit to the db' do
        user.validate
        expect(user.saved_change_to_confirmation_required?).to be false
        expect(user.saved_change_to_email_confirmed_at?).to be false
      end
    end

    describe '#reset_confirmation_and_counts' do
      before do
        user.update!(
          email_confirmation_code: '1234',
          email_confirmation_retry_count: 2,
          email_confirmation_code_reset_count: 2
        )
      end

      it 'resets counts and required if already confirmed' do
        user.confirm
        user.reset_confirmation_and_counts

        expect(user.confirmation_required?).to be true
        expect(user.email_confirmation_code_sent_at).to be_nil
        expect(user.email_confirmation_code).to be_nil
        expect(user.email_confirmation_retry_count).to eq 0
        expect(user.email_confirmation_code_reset_count).to eq 0
      end

      it 'only resets confirmation_required if not confirmed' do
        user.reset_confirmation_and_counts

        expect(user.confirmation_required?).to be true
        expect(user.email_confirmed_at).to be_nil
        expect(user.email_confirmation_code_changed?).to be false
        expect(user.email_confirmation_retry_count_changed?).to be false
        expect(user.email_confirmation_code_reset_count_changed?).to be false
      end
    end

    describe '#confirm' do
      it 'sets the email_confirmed_at field' do
        user.save!
        user.confirm
        expect(user.email_confirmed_at).not_to be_nil
      end

      it 'sets confirmation_required? to false' do
        user.save!
        user.confirm
        expect(user.confirmation_required?).to be false
      end
    end

    describe '#email' do
      let(:email) { 'new_email@email.com' }

      context 'user confirmation is turned on' do
        before { SettingsService.new.activate_feature! 'user_confirmation' }

        it 'raises a taken error if email already exists' do
          create(:user, email: 'new_email@email.com')
          expect { user.update!(email: email) }.to raise_error(ActiveRecord::RecordInvalid)
        end

        it 'raises an invalid error if email is invalid' do
          invalid_email = 'newemail_com'
          expect { user.update!(email: invalid_email) }.to raise_error(ActiveRecord::RecordInvalid)
        end

        context 'when form submitted' do
          let(:save_options) { { context: :form_submission } }

          it 'cannot change the email if the user is passwordless' do
            user.update!(password: nil)
            user.assign_attributes(email: email)
            expect { user.save!(**save_options) }.to raise_error(ActiveRecord::RecordInvalid)
          end
        end
      end
    end

    describe '#confirm!' do
      before do
        SettingsService.new.activate_feature! 'user_confirmation'
      end

      it 'sets email confirmed at' do
        user.save!
        expect { user.confirm! }.to change(user, :saved_change_to_email_confirmed_at?)
      end

      it 'cancels any pending email change initiated with the same email' do
        new_email = 'new-email@provider.org'
        user1, user2 = create_list(:user, 2, new_email: new_email, email_confirmation_code: 9999)
        user1.update_column(:confirmation_required, true)
        user1.save!

        user1.confirm!

        user2.reload
        expect(user2.new_email).to be_nil
        expect(user2.email_confirmation_code).to be_nil
      end
    end
  end

  describe '#no_name?' do
    it 'returns true if first_name and last_name are null' do
      user = described_class.new(email: 'test@citizenlab.co', first_name: nil, last_name: nil)
      expect(user.no_name?).to be true
    end

    it 'returns true if first_name and last_name are blank strings' do
      user = described_class.new(email: 'test@citizenlab.co', first_name: '', last_name: '')
      expect(user.no_name?).to be true
    end

    it 'returns false if first_name is set' do
      user = described_class.new(email: 'test@citizenlab.co', first_name: 'Bob')
      expect(user.no_name?).to be false
    end

    it 'returns false if last_name is set' do
      user = described_class.new(email: 'test@citizenlab.co', last_name: 'Smith')
      expect(user.no_name?).to be false
    end

    it 'returns false if invite is pending' do
      user = described_class.new(email: 'test@citizenlab.co', invite_status: 'pending')
      expect(user.no_name?).to be false
    end
  end

  describe '#full_name' do
    it 'returns a consistent anonymous name if first_name and last_name are not set' do
      settings = AppConfiguration.instance.settings
      settings['core']['anonymous_name_scheme'] = 'animal'
      AppConfiguration.instance.update!(settings: settings)
      user = described_class.new(email: 'test@citizenlab.co')
      expect(user.full_name).to eq 'Aardvark Cat'
      expect(user.no_name?).to be true
    end
  end

  describe '#first_name' do
    it 'does not allow HTML in the name' do
      user = described_class.new
      user.first_name = '<script>alert("hacked")</script>Bob'
      user.validate
      expect(user.first_name).to eq 'alert("hacked")Bob'
    end

    it 'does not change valid names' do
      user = described_class.new
      user.first_name = 'Terry'
      user.validate
      expect(user.first_name).to eq 'Terry'
    end
  end

  describe '#last_name' do
    it 'does not allow HTML in the name' do
      user = described_class.new
      user.last_name = '<script>alert("hacked")</script><p>Bob</p>'
      user.validate
      expect(user.last_name).to eq 'alert("hacked")Bob'
    end

    it 'does not change valid names' do
      user = described_class.new
      user.first_name = 'Smith'
      user.validate
      expect(user.first_name).to eq 'Smith'
    end
  end

  context 'billed users' do
    def create_admin_moderator(factory)
      create(factory).tap do |user|
        user.roles << { type: 'admin' }
        user.save!
      end
    end

    describe '.billed_admins' do
      it 'returns admins' do
        create(:user)
        admin = create(:admin)
        expect(described_class.billed_admins).to contain_exactly(admin)
      end

      it 'does not return Go Vocal admins' do
        create(:user)
        create(:admin, email: 'test@govocal.com')
        non_gv_admin = create(:admin)
        expect(described_class.billed_admins).to contain_exactly(non_gv_admin)
      end

      it 'does not return project and folder moderators' do
        create(:user)
        admin = create(:admin)
        create(:project_moderator)
        create(:project_folder_moderator)
        expect(described_class.billed_admins).to contain_exactly(admin)
      end

      it 'returns admins who are also project or folder moderators' do
        create(:user)
        admin = create_admin_moderator(:project_moderator)
        admin1 = create_admin_moderator(:project_folder_moderator)
        expect(described_class.billed_admins).to contain_exactly(admin, admin1)
      end
    end

    describe '.billed_moderators' do
      it 'returns project and folder moderators' do
        create(:user)
        project_moderator = create(:project_moderator)
        folder_moderator = create(:project_folder_moderator)
        expect(described_class.billed_moderators).to contain_exactly(project_moderator, folder_moderator)
      end

      it 'does not return Go Vocal moderators' do
        create(:user)
        create(:project_moderator, email: 'test@govocal.eu')
        non_cl_project_moderator = create(:project_moderator)
        expect(described_class.billed_moderators).to contain_exactly(non_cl_project_moderator)
      end

      it 'does not return admins' do
        create(:user)
        project_moderator = create(:project_moderator)
        folder_moderator = create(:project_folder_moderator)
        create(:admin)
        expect(described_class.billed_moderators).to contain_exactly(project_moderator, folder_moderator)
      end

      it 'does not return admins who are also project or folder moderators' do
        create(:user)
        create(:admin)
        project_moderator = create(:project_moderator)
        folder_moderator = create(:project_folder_moderator)
        create_admin_moderator(:project_moderator)
        create_admin_moderator(:project_folder_moderator)
        expect(described_class.billed_moderators).to contain_exactly(project_moderator, folder_moderator)
      end
    end
  end

  context '(super_admins scopes)' do
    let_it_be(:super_admins) { create_list(:super_admin, 1) }
    let_it_be(:non_super_admins) do
      [
        create(:user),
        create(:admin),
        create(:project_moderator, email: 'hello@govocal.com')
      ]
    end

    it '.super_admins returns super admins only' do
      expect(described_class.super_admins).to match_array(super_admins)
    end

    it '.non_super_admins returns non super admins' do
      expect(described_class.not_super_admins).to match_array(non_super_admins)
    end
  end

  context 'project reviewer scope' do
    let_it_be(:project_reviewers) { create_list(:admin, 2, :project_reviewer) }
    let_it_be(:non_project_reviewers) do
      [
        create(:user),
        create(:admin),
        create(:project_moderator)
      ]
    end

    specify do
      expect(described_class.project_reviewers).to match_array(project_reviewers)
    end

    specify do
      expect(described_class.project_reviewers(false)).to match_array(non_project_reviewers)
    end
  end
end
