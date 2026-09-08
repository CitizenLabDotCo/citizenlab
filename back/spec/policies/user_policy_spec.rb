# frozen_string_literal: true

require 'rails_helper'

describe UserPolicy do
  subject { described_class.new current_user, subject_user }

  let(:scope) { UserPolicy::Scope.new current_user, User }

  context 'for a visitor' do
    let(:current_user) { nil }
    let(:subject_user) { create(:user) }

    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:index_xlsx) }
    it { is_expected.not_to permit(:participation_stats) }

    it 'does not index the user through the scope' do
      subject_user.save!
      expect(scope.resolve.size).to eq 0
    end

    context 'when subject user has no public contributions' do
      it { is_expected.not_to permit(:show) }
    end

    context 'when subject user has a non-anonymous idea in an ideation phase' do
      before { create(:idea, author: subject_user, anonymous: false) }

      it { is_expected.to permit(:show) }
    end

    context 'when subject user has comments' do
      before { create(:comment, author: subject_user) }

      it { is_expected.to permit(:show) }
    end
  end

  context 'for a resident' do
    let(:current_user) { create(:user) }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }
      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.to     permit(:participation_stats) }

      it 'does not index the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a blocked resident on theirself' do
      let(:current_user) { create(:user, block_end_at: 5.days.from_now) }
      let(:subject_user) { current_user }

      it { is_expected.to     permit(:show) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.to     permit(:destroy) }
      it { is_expected.to     permit(:participation_stats) }
    end

    context 'on someone else' do
      let(:subject_user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:participation_stats) }

      context 'when subject user has public contributions' do
        before { create(:idea, author: subject_user, anonymous: false) }

        it { is_expected.to permit(:show) }
      end

      it 'indexes the users through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 0
      end
    end
  end

  context 'for an admin' do
    let(:current_user) { create(:admin) }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:index) }
      it { is_expected.to permit(:index_xlsx) }
      it { is_expected.to permit(:participation_stats) }

      it 'indexes the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'on someone else' do
      let(:subject_user) { create(:user) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:index) }
      it { is_expected.to permit(:index_xlsx) }
      it { is_expected.to permit(:participation_stats) }

      it 'indexes the users through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 2
      end
    end
  end

  context 'for a project moderator' do
    let(:project1) { create(:project) }
    let(:project2) { create(:project) }
    let(:current_user) { create(:project_moderator, projects: [project1, project2]) }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }
      it { is_expected.to     permit(:index)   }
      it { is_expected.not_to permit(:block)   }
      it { is_expected.not_to permit(:unblock) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.to     permit(:participation_stats) }

      it 'indexes the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'on someone else' do
      let(:subject_user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to     permit(:index)   }
      it { is_expected.not_to permit(:block)   }
      it { is_expected.not_to permit(:unblock) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:participation_stats) }

      it 'does not index the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    it 'only indexes admins and moderators of the same projects' do
      moderators = [
        create(:project_moderator, projects: [create(:project), project1]),
        create(:project_moderator, projects: [create(:project)]),
        create(:project_moderator, projects: [project2])
      ]
      create(:idea).author
      participant = create(:idea, project: project2).author
      admin = create(:admin)
      expect(scope.resolve.ids).to contain_exactly(participant.id, current_user.id, moderators[0].id, moderators[2].id, admin.id)
    end
  end

  context 'for a folder moderator' do
    let(:project1) { create(:project) }
    let(:project2) { create(:project) }
    let(:folder1) { create(:project_folder, projects: [project1]) }
    let(:folder2) { create(:project_folder, projects: [project2]) }
    let(:current_user) { create(:project_folder_moderator, project_folders: [folder1, folder2]) }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }
      it { is_expected.to     permit(:index)   }
      it { is_expected.not_to permit(:block)   }
      it { is_expected.not_to permit(:unblock) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.to     permit(:participation_stats) }

      it 'indexes the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'on someone else' do
      let(:subject_user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to     permit(:index)   }
      it { is_expected.not_to permit(:block)   }
      it { is_expected.not_to permit(:unblock) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { is_expected.not_to permit(:participation_stats) }

      it 'does not index the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    it 'only indexes admins and moderators of the same projects' do
      moderators = [
        create(:project_moderator, projects: [create(:project), project1]),
        create(:project_folder_moderator, project_folders: [create(:project_folder)]),
        create(:project_folder_moderator, project_folders: [folder2]),
        create(:project_moderator, projects: [create(:project)])
      ]
      create(:comment).author
      participant = create(:idea, project: project2).author
      admin = create(:admin)
      expect(scope.resolve.ids).to contain_exactly(participant.id, current_user.id, moderators[0].id, moderators[2].id, admin.id)
    end
  end

  describe 'phone signup' do
    let(:current_user) { nil }
    let(:subject_user) { build(:user) }

    before { SettingsService.new.activate_feature! 'sms_login' }

    context 'when the sms and password_login features are enabled' do
      include_context 'with sms feature enabled'

      before { SettingsService.new.activate_feature! 'password_login' }

      it { is_expected.to permit(:check_phone) }
      it { is_expected.to permit(:create_phone) }
    end

    context 'when the sms feature is disabled' do
      before { SettingsService.new.activate_feature! 'password_login' }

      it { is_expected.not_to permit(:check_phone) }
      it { is_expected.not_to permit(:create_phone) }
      it { is_expected.to permit(:check_email) }
      it { is_expected.to permit(:create) }
    end

    context 'when password_login is disabled' do
      include_context 'with sms feature enabled'

      before { SettingsService.new.deactivate_feature! 'password_login' }

      it { is_expected.not_to permit(:check_phone) }
      it { is_expected.not_to permit(:create_phone) }
    end

    context 'when the sms_login feature is disabled' do
      include_context 'with sms feature enabled'

      before do
        SettingsService.new.activate_feature! 'password_login'
        SettingsService.new.deactivate_feature! 'sms_login'
      end

      it { is_expected.not_to permit(:check_phone) }
      it { is_expected.not_to permit(:create_phone) }

      context 'with an authenticated user' do
        let(:current_user) { create(:admin) }

        it { is_expected.to permit(:check_phone) }
        it { is_expected.to permit(:create_phone) }
      end
    end
  end

  describe 'permitted_attributes_for_update' do
    subject(:permitted) { described_class.new(current_user, subject_user).permitted_attributes_for_update }

    def permits_early_access_features?
      permitted.any? { |attribute| attribute.is_a?(Hash) && attribute.key?(:early_access_features) }
    end

    context 'for an admin on their own record' do
      let(:current_user) { create(:admin) }
      let(:subject_user) { current_user }

      it { expect(permits_early_access_features?).to be true }
    end

    context 'for an admin on somebody else' do
      let(:current_user) { create(:admin) }
      let(:subject_user) { create(:admin) }

      it { expect(permits_early_access_features?).to be false }
    end

    context 'for a resident on their own record' do
      let(:current_user) { create(:user) }
      let(:subject_user) { current_user }

      it { expect(permits_early_access_features?).to be false }
    end
  end
end
