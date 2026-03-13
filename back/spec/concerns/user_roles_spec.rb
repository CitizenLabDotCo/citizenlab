# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserRoles do
  describe 'scopes' do
    before do
      create(:user, roles: [{ 'type' => 'admin', 'project_reviewer' => true }], email: 'admin@example.com')
      create(:user, roles: [{ 'type' => 'admin' }], email: 'super@citizenlab.eu')
      create(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }], email: 'project_mod@example.com')
      create(:user, roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => '123' }], email: 'folder_mod@example.com')
      create(:user, roles: [], email: 'normal_user@example.com')
    end

    describe '.admin' do
      it 'returns only admins' do
        expect(User.admin.count).to eq(2)
      end
    end

    describe '.not_admin' do
      it 'returns only non-admins' do
        expect(User.not_admin.count).to eq(3)
      end
    end

    describe '.normal_user' do
      it 'returns users with no roles' do
        expect(User.normal_user.count).to eq(1)
      end
    end

    describe '.not_normal_user' do
      it 'returns users with any role' do
        expect(User.not_normal_user.count).to eq(4)
      end
    end

    describe '.project_moderator' do
      it 'returns only project moderators' do
        expect(User.project_moderator.count).to eq(1)
      end
    end

    describe '.not_project_moderator' do
      it 'returns only non-project moderators' do
        expect(User.not_project_moderator.count).to eq(4)
      end
    end

    describe '.project_folder_moderator' do
      it 'returns only project folder moderators' do
        expect(User.project_folder_moderator.count).to eq(1)
      end
    end

    describe '.not_project_folder_moderator' do
      it 'returns only non-project folder moderators' do
        expect(User.not_project_folder_moderator.count).to eq(4)
      end
    end

    describe '.project_reviewers' do
      it 'returns only project reviewers' do
        expect(User.project_reviewers.count).to eq(1)
      end
    end

    describe '.admin_or_moderator' do
      it 'returns admins and moderators' do
        expect(User.admin_or_moderator.count).to eq(4)
      end
    end

    describe '.order_role' do
      it 'orders admins first, then other users' do
        expected_ordered_users = User.order_role
        expected_admin_emails = expected_ordered_users.limit(2).pluck(:email)

        # First two should be admins (ordering uncertain)
        expect(expected_admin_emails).to contain_exactly('super@citizenlab.eu', 'admin@example.com')

        # Remaining users are non-admins (ordering uncertain)
        expected_non_admin_emails = expected_ordered_users.offset(2).pluck(:email)
        expect(expected_non_admin_emails).to contain_exactly('project_mod@example.com', 'folder_mod@example.com', 'normal_user@example.com')
      end
    end

    describe '.billed_admins' do
      it 'returns admins that are not citizenlab members' do
        expect(User.billed_admins.count).to eq(1)
        expect(User.billed_admins.first.email).to eq('admin@example.com')
      end
    end

    describe '.billed_moderators' do
      it 'returns moderators that are not citizenlab members' do
        expect(User.billed_moderators.count).to eq(2)
        expect(User.billed_moderators.pluck(:email)).to contain_exactly('project_mod@example.com', 'folder_mod@example.com')
      end
    end

    describe '.super_admins' do
      it 'returns admins with citizenlab/govocal emails' do
        expect(User.super_admins.count).to eq(1)
        expect(User.super_admins.first.email).to eq('super@citizenlab.eu')
      end
    end

    describe '.not_super_admins' do
      it 'returns users that are not super admins' do
        expect(User.not_super_admins.count).to eq(4)
        expect(User.not_super_admins.pluck(:email)).to contain_exactly('admin@example.com', 'project_mod@example.com', 'folder_mod@example.com', 'normal_user@example.com')
      end
    end
  end

  describe '#highest_role' do
    it 'returns :super_admin for admin with citizenlab email' do
      user = build(:user, roles: [{ 'type' => 'admin' }], email: 'test@citizenlab.eu')
      expect(user.highest_role).to eq(:super_admin)
    end

    it 'returns :super_admin for admin with govocal email' do
      user = build(
        :user,
        roles: [
          { 'type' => 'admin' },
          { 'type' => 'project_folder_moderator', 'project_folder_id' => '123' },
          { 'type' => 'project_moderator', 'project_id' => '456' }
        ],
        email: 'test@govocal.com'
      )

      expect(user.highest_role).to eq(:super_admin)
    end

    it 'returns :admin for admin with non-citizenlab email' do
      user = build(
        :user,
        roles: [
          { 'type' => 'admin' },
          { 'type' => 'project_folder_moderator', 'project_folder_id' => '123' },
          { 'type' => 'project_moderator', 'project_id' => '456' }
        ],
        email: 'test@example.com'
      )

      expect(user.highest_role).to eq(:admin)
    end

    it 'returns :project_folder_moderator for folder moderator' do
      user = build(
        :user,
        roles: [
          { 'type' => 'project_folder_moderator', 'project_folder_id' => '123' },
          { 'type' => 'project_moderator', 'project_id' => '456' }
        ]
      )

      expect(user.highest_role).to eq(:project_folder_moderator)
    end

    it 'returns :project_moderator for project moderator' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user.highest_role).to eq(:project_moderator)
    end

    it 'returns :user for normal user' do
      user = build(:user, roles: [])
      expect(user.highest_role).to eq(:user)
    end
  end

  describe '#super_admin?' do
    it 'returns true for admin with citizenlab email' do
      user = build(:user, roles: [{ 'type' => 'admin' }], email: 'test@citizenlab.be')
      expect(user).to be_super_admin
    end

    it 'returns true for admin with govocal email' do
      user = build(:user, roles: [{ 'type' => 'admin' }], email: 'test@govocal.nl')
      expect(user).to be_super_admin
    end

    it 'returns false for admin with other email' do
      user = build(:user, roles: [{ 'type' => 'admin' }], email: 'test@example.com')
      expect(user).not_to be_super_admin
    end

    it 'returns false for non-admin with citizenlab email' do
      user = build(:user, roles: [], email: 'test@citizenlab.eu')
      expect(user).not_to be_super_admin
    end
  end

  describe '#admin?' do
    it 'returns true when user has admin role' do
      user = build(:user, roles: [{ 'type' => 'admin' }])
      expect(user).to be_admin
    end

    it 'returns false when user has no admin role' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user).not_to be_admin
    end
  end

  describe '#project_folder_moderator?' do
    it 'returns true when user is folder moderator' do
      user = build(:user, roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => '123' }])
      expect(user.project_folder_moderator?).to be true
    end

    it 'returns true when checking specific folder user moderates' do
      user = build(:user, roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => '123' }])
      expect(user.project_folder_moderator?('123')).to be true
    end

    it 'returns false when checking folder user does not moderate' do
      user = build(:user, roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => '123' }])
      expect(user.project_folder_moderator?('456')).to be false
    end
  end

  describe '#project_moderator?' do
    it 'returns true when user is project moderator' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user.project_moderator?).to be true
    end

    it 'returns true when checking specific project user moderates' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user.project_moderator?('123')).to be true
    end

    it 'returns true when user is project moderator through folder moderation' do
      folder = create(:project_folder)
      project = create(:project, folder: folder)
      user = build(:user, roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id }])
      expect(user.project_moderator?(project.id)).to be true
    end

    it 'returns false when checking project user does not moderate' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user.project_moderator?('456')).to be false
    end
  end

  describe '#normal_user?' do
    it 'returns true for user with no roles' do
      user = build(:user, roles: [])
      expect(user).to be_normal_user
    end

    it 'returns false for admin' do
      user = build(:user, roles: [{ 'type' => 'admin' }])
      expect(user).not_to be_normal_user
    end

    it 'returns false for project moderator' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user).not_to be_normal_user
    end
  end

  describe '#moderatable_project_ids' do
    let!(:project_a) { create(:project) }
    let!(:project_b) { create(:project) }
    let!(:project_c) { create(:project) }
    let!(:folder) { create(:project_folder, projects: [project_b]) }

    it 'returns project ids of projects a user can moderate' do
      user = build(
        :user,
        roles: [
          { 'type' => 'project_moderator', 'project_id' => project_a.id },
          { 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id }
        ]
      )

      expect(user.moderatable_project_ids).to contain_exactly(project_a.id, project_b.id)
    end
  end

  describe '#moderated_project_folder_ids' do
    it 'returns folder ids of folders a user can moderate' do
      user = build(
        :user,
        roles: [
          { 'type' => 'project_folder_moderator', 'project_folder_id' => '123' },
          { 'type' => 'project_folder_moderator', 'project_folder_id' => '456' }
        ]
      )

      expect(user.moderated_project_folder_ids).to contain_exactly('123', '456')
    end
  end

  describe '#add_role' do
    it 'adds a role to the user' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      user.add_role(:admin)

      expect(user.roles).to eq([{ 'type' => 'project_moderator', 'project_id' => '123' }, { 'type' => 'admin' }])
    end

    it 'adds a role with options' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      user.add_role(:project_moderator, project_id: '456')

      expect(user.roles).to eq([{ 'type' => 'project_moderator', 'project_id' => '123' }, { 'type' => 'project_moderator', 'project_id' => '456' }])
    end

    it 'does not add duplicate roles' do
      user = build(:user, roles: [{ 'type' => 'admin' }])
      user.add_role(:admin)
      expect(user.roles).to eq([{ 'type' => 'admin' }])
    end
  end

  describe '#delete_role' do
    it 'removes a role from the user' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }, { 'type' => 'admin' }])
      user.delete_role(:admin)

      expect(user.roles).to eq([{ 'type' => 'project_moderator', 'project_id' => '123' }])
    end

    it 'removes a role with options' do
      user = build(
        :user,
        roles: [
          { 'type' => 'project_moderator', 'project_id' => '123' },
          { 'type' => 'project_moderator', 'project_id' => '456' }
        ]
      )
      user.delete_role(:project_moderator, project_id: '123')

      expect(user.roles).to eq([{ 'type' => 'project_moderator', 'project_id' => '456' }])
    end
  end
end
