# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserRoles do
  describe 'scopes' do
    let!(:space_a) { create(:space) }
    let!(:project_a) { create(:project, space: space_a) }
    let!(:folder_a) { create(:project_folder, projects: [project_a], space: space_a) }

    let!(:space_b) { create(:space) }

    let!(:project_b) { create(:project, space: space_b) }
    let!(:folder_b) { create(:project_folder, projects: [project_b], space: space_b) }

    let!(:admin) { create(:admin) }
    let!(:admin_reviewer) { create(:admin, roles: [{ 'type' => 'admin', 'project_reviewer' => true }]) }
    let!(:space_moderator_a) { create(:space_moderator, spaces: [space_a]) }
    let!(:space_moderator_b) { create(:space_moderator) } # For random space
    let!(:folder_moderator_a) { create(:project_folder_moderator, project_folders: [folder_a]) }
    let!(:folder_moderator_b) { create(:project_folder_moderator) } # For random folder
    let!(:project_moderator_a) { create(:project_moderator, projects: [project_a]) }
    let!(:project_moderator_b) { create(:project_moderator) } # For random project
    let!(:normal_user) { create(:user) }

    describe '.admin' do
      it 'returns only admins' do
        expect(User.admin).to contain_exactly(admin, admin_reviewer)
      end
    end

    describe '.not_admin' do
      it 'returns only non-admins' do
        expect(User.not_admin).to contain_exactly(
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
      end
    end

    describe '.normal_user' do
      it 'returns users with no roles' do
        expect(User.normal_user).to contain_exactly(normal_user)
      end
    end

    describe '.not_normal_user' do
      it 'returns users with any role' do
        expect(User.not_normal_user).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b
        )
      end
    end

    describe '.project_moderator' do
      it 'returns only project moderators when no specific project is given' do
        expect(User.project_moderator).to contain_exactly(project_moderator_a, project_moderator_b)
      end

      it 'returns only project moderators of a specific project' do
        expect(User.project_moderator(project_a.id)).to contain_exactly(project_moderator_a)
      end
    end

    describe '.not_project_moderator' do
      it 'returns only users who are not project moderators when no specific project is given' do
        expect(User.not_project_moderator).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          normal_user
        )
      end

      it 'returns only users who are not project moderators of a specific project' do
        expect(User.not_project_moderator(project_a.id)).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_b,
          normal_user
        )
      end
    end

    describe '.project_folder_moderator' do
      it 'returns only project folder moderators when no specific folder(s) given' do
        expect(User.project_folder_moderator).to contain_exactly(folder_moderator_a, folder_moderator_b)
      end

      it 'returns only project folder moderators of a specific folder' do
        expect(User.project_folder_moderator(folder_a.id)).to eq([folder_moderator_a])
      end

      it 'returns only project folder moderators of all specified folders' do
        folder_moderator_c = create(:project_folder_moderator, project_folders: [folder_a, folder_b])

        expect(User.project_folder_moderator(folder_a.id, folder_b.id)).to eq([folder_moderator_c])
      end
    end

    describe '.not_project_folder_moderator' do
      it 'returns only users who are not project folder moderators when no specific folder(s) given' do
        expect(User.not_project_folder_moderator).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
      end

      it 'returns only users who are not project folder moderators of a specific folder' do
        expect(User.not_project_folder_moderator(folder_a.id)).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
      end

      it 'returns only users who are not project folder moderators of all specified folders' do
        folder_moderator_c = create(:project_folder_moderator, project_folders: [folder_a, folder_b])

        expect(User.not_project_folder_moderator(folder_a.id, folder_b.id)).not_to include(folder_moderator_c)
        expect(User.not_project_folder_moderator(folder_a.id, folder_b.id)).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
      end
    end

    describe '.space_moderator' do
      it 'returns only space moderators when no specific space is given' do
        expect(User.space_moderator).to contain_exactly(space_moderator_a, space_moderator_b)
      end

      it 'returns only space moderators of a specific space' do
        expect(User.space_moderator(space_a.id)).to eq([space_moderator_a])
      end
    end

    describe '.not_space_moderator' do
      it 'returns only users who are not space moderators when no specific space is given' do
        expect(User.not_space_moderator).to contain_exactly(
          admin,
          admin_reviewer,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
      end

      it 'returns only users who are not space moderators of a specific space' do
        expect(User.not_space_moderator(space_a.id)).to contain_exactly(
          admin,
          admin_reviewer,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          space_moderator_b,
          normal_user
        )
      end
    end

    describe '.project_reviewers' do
      it 'returns only project reviewers' do
        expect(User.project_reviewers).to eq([admin_reviewer])
      end
    end

    describe '.moderator' do
      it 'returns all moderators but not admins or normal users' do
        expect(User.moderator).to contain_exactly(
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b
        )
      end
    end

    describe '.not_moderator' do
      it 'returns only non-moderators' do
        expect(User.not_moderator).to contain_exactly(
          admin,
          admin_reviewer,
          normal_user
        )
      end
    end

    describe '.admin_or_moderator' do
      it 'returns admins and moderators' do
        expect(User.admin_or_moderator).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b
        )
      end
    end

    describe '.can_moderate' do
      context 'without project_id' do
        it 'returns all admins and moderators' do
          expect(User.can_moderate).to contain_exactly(
            admin,
            admin_reviewer,
            space_moderator_a,
            space_moderator_b,
            folder_moderator_a,
            folder_moderator_b,
            project_moderator_a,
            project_moderator_b
          )
        end
      end

      context 'with project_id' do
        it 'returns admins and moderators of the project (including folder and space moderators)' do
          expect(User.can_moderate(project_a.id)).to contain_exactly(
            admin,
            admin_reviewer,
            project_moderator_a,
            folder_moderator_a,
            space_moderator_a
          )
        end

        it 'returns admins and project moderator only when project has no folder or space' do
          project_without_folder = create(:project)
          project_mod = create(:project_moderator, projects: [project_without_folder])

          expect(User.can_moderate(project_without_folder.id)).to contain_exactly(
            admin,
            admin_reviewer,
            project_mod
          )
        end
      end
    end

    describe '.order_role' do
      it 'orders admins first, then other users' do
        expected_ordered_users = User.order_role
        expected_admins = expected_ordered_users.limit(2)

        # First two should be admins (ordering uncertain)
        expect(expected_admins).to contain_exactly(admin, admin_reviewer)

        # Remaining users are non-admins (ordering uncertain)
        expected_non_admins = expected_ordered_users.offset(2)
        expect(expected_non_admins).to contain_exactly(
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
      end
    end

    describe '.not_a_citizenlab_member' do
      it 'returns only users that are not citizenlab or GioVocal members' do
        create(:user, email: 'user1@citizenlab.co')
        create(:user, email: 'user2@govocal.com')

        expect(User.not_citizenlab_member).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
      end
    end

    describe '.billed_admins' do
      it 'returns admins that are not citizenlab members' do
        create(:admin, email: 'admincl@citizenlab.co')
        create(:admin, email: 'admingv@govocal.com')

        expect(User.billed_admins).to contain_exactly(admin, admin_reviewer)
      end
    end

    describe '.billed_moderators' do
      it 'returns moderators that are not citizenlab members' do
        create(:project_moderator, email: 'project_mod_cl@citizenlab.co')
        create(:project_folder_moderator, email: 'folder_mod_gv@govocal.com')

        expect(User.billed_moderators).to contain_exactly(
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b
        )
      end

      it 'does not include admins that are also moderators' do
        create(:admin, roles: [{ 'type' => 'admin' }, { 'type' => 'project_moderator', 'project_id' => project_a.id }])
        create(:admin, roles: [{ 'type' => 'admin' }, { 'type' => 'project_folder_moderator', 'project_folder_id' => folder_a.id }])
        create(:admin, roles: [{ 'type' => 'admin' }, { 'type' => 'space_moderator', 'space_id' => space_a.id }])

        expect(User.billed_moderators).to contain_exactly(
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b
        )
      end
    end

    describe '.super_admins' do
      it 'returns admins with citizenlab/govocal emails' do
        super_admin_emails = %w[
          admincl@citizenlab.co
          admingv@govocal.com
          hello+admin@citizenLab.co
          hello@citizenlab.eu
          moderator+admin@citizenlab.be
          cheese.lover@CitizenLab.ch
          Fritz+Wurst@Citizenlab.de
          breek.nou.mijn.klomp@citizenlab.NL
          bigger@citizenlab.us
          magdalena@citizenlab.cl
          hello+admin@CITIZENLAB.UK
          hello@govocal.com
          hello+admin@govocal.com
          hello@govocal.eu
          moderator+admin@govocal.be
          cheese.lover@Govocal.ch
          Fritz+Wurst@Govocal.de
          breek.nou.mijn.klomp@govocal.NL
          bigger@govocal.us
          magdalena@govocal.cl
          hello+admin@GOVOCAL.UK
        ]
        super_admins = super_admin_emails.map { |email| create(:admin, email: email) }

        expect(User.super_admins).to match_array(super_admins)
      end
    end

    describe '.not_super_admins' do
      it 'returns users that are not super admins' do
        create(:admin, email: 'admincl@citizenlab.co')
        create(:admin, email: 'admingv@govocal.com')

        expect(User.not_super_admins).to contain_exactly(
          admin,
          admin_reviewer,
          space_moderator_a,
          space_moderator_b,
          folder_moderator_a,
          folder_moderator_b,
          project_moderator_a,
          project_moderator_b,
          normal_user
        )
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

    it 'returns :space_moderator for space moderator' do
      user = build(
        :user,
        roles: [
          { 'type' => 'space_moderator', 'space_id' => '123' },
          { 'type' => 'project_folder_moderator', 'project_folder_id' => '123' },
          { 'type' => 'project_moderator', 'project_id' => '456' }
        ]
      )

      expect(user.highest_role).to eq(:space_moderator)
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

    it 'returns false when user is project moderator through folder moderation' do
      folder = create(:project_folder)
      project = create(:project, folder: folder)
      user = build(:user, roles: [{ 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id }])
      expect(user.project_moderator?(project.id)).to be false
    end

    it 'returns false when checking project user does not moderate' do
      user = build(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user.project_moderator?('456')).to be false
    end

    it 'return false if user is space moderator and can indirectly moderate project, but is not a direct moderator (specific project)' do
      space = create(:space)
      project = create(:project, space: space)
      user = build(:user, roles: [{ 'type' => 'space_moderator', 'space_id' => space.id }])
      expect(user.project_moderator?(project.id)).to be false
    end

    it 'return false if user is space moderator and can indirectly moderate project, but is not a direct moderator (no specific project)' do
      space = create(:space)
      create(:project, space: space)
      user = build(:user, roles: [{ 'type' => 'space_moderator', 'space_id' => space.id }])
      expect(user.project_moderator?).to be false
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

    it 'returns false for space moderator' do
      user = build(:user, roles: [{ 'type' => 'space_moderator', 'space_id' => '123' }])
      expect(user).not_to be_normal_user
    end

    it 'returns false for user with multiple roles' do
      user = build(:user, roles: [{ 'type' => 'admin' }, { 'type' => 'project_moderator', 'project_id' => '123' }])
      expect(user).not_to be_normal_user
    end
  end

  describe '#moderatable_project_ids' do
    let!(:space) { create(:space) }
    let!(:project_a) { create(:project) }
    let!(:project_b) { create(:project) }
    let!(:project_c) { create(:project, space: space) }
    let!(:folder) { create(:project_folder, projects: [project_b]) }

    it 'returns project ids of projects a user can moderate' do
      user = build(
        :user,
        roles: [
          { 'type' => 'project_moderator', 'project_id' => project_a.id },
          { 'type' => 'project_folder_moderator', 'project_folder_id' => folder.id },
          { 'type' => 'space_moderator', 'space_id' => space.id }
        ]
      )

      expect(user.moderatable_project_ids).to contain_exactly(project_a.id, project_b.id, project_c.id)
    end

    it 'includes projects in moderated spaces' do
      user = build(
        :user,
        roles: [
          { 'type' => 'space_moderator', 'space_id' => space.id }
        ]
      )

      expect(user.moderatable_project_ids).to contain_exactly(project_c.id)
    end
  end

  describe '#moderatable_folder_ids' do
    let!(:space) { create(:space) }
    let!(:folder_a) { create(:project_folder) }
    let!(:folder_b) { create(:project_folder) }
    let!(:folder_c) { create(:project_folder, space: space) }

    it 'returns folder ids of folders a user can moderate' do
      user = build(
        :user,
        roles: [
          { 'type' => 'project_folder_moderator', 'project_folder_id' => folder_a.id },
          { 'type' => 'space_moderator', 'space_id' => space.id }
        ]
      )

      expect(user.moderatable_folder_ids).to contain_exactly(folder_a.id, folder_c.id)
    end

    it 'includes folders the user moderates directly' do
      user = build(
        :user,
        roles: [
          { 'type' => 'project_folder_moderator', 'project_folder_id' => folder_a.id },
          { 'type' => 'project_folder_moderator', 'project_folder_id' => folder_b.id }
        ]
      )

      expect(user.moderatable_folder_ids).to contain_exactly(folder_a.id, folder_b.id)
    end

    it 'includes folders in moderated spaces' do
      user = build(
        :user,
        roles: [
          { 'type' => 'space_moderator', 'space_id' => space.id }
        ]
      )

      expect(user.moderatable_folder_ids).to contain_exactly(folder_c.id)
    end

    it 'returns empty array for normal user' do
      user = build(:user, roles: [])

      expect(user.moderatable_folder_ids).to be_empty
    end

    it 'returns empty array for project moderator only' do
      project = create(:project)
      user = build(
        :user,
        roles: [
          { 'type' => 'project_moderator', 'project_id' => project.id }
        ]
      )

      expect(user.moderatable_folder_ids).to be_empty
    end

    it 'does not include duplicate folder ids' do
      # Create a folder in a space, and give user both direct and space moderation
      user = build(
        :user,
        roles: [
          { 'type' => 'project_folder_moderator', 'project_folder_id' => folder_c.id },
          { 'type' => 'space_moderator', 'space_id' => space.id }
        ]
      )

      expect(user.moderatable_folder_ids).to contain_exactly(folder_c.id)
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
