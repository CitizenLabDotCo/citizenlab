# frozen_string_literal: true

require 'rails_helper'

describe UserPolicy do
  subject { described_class.new current_user, subject_user }

  let(:scope) { UserPolicy::Scope.new current_user, User }

  context 'for a visitor' do
    let(:current_user) { nil }
    let(:subject_user) { create(:user) }

    it { is_expected.to     permit(:show)    }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'should not index the user through the scope' do
      subject_user.save!
      expect(scope.resolve.size).to eq 0
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

      it 'should not index the user through the scope' do
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
    end

    context 'on someone else' do
      let(:subject_user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'should index the users through the scope' do
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

      it 'should index the user through the scope' do
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

      it 'should index the users through the scope' do
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
      expect(scope.resolve.ids).to match_array [participant.id, current_user.id, moderators[0].id, moderators[2].id, admin.id]
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
      expect(scope.resolve.ids).to match_array [participant.id, current_user.id, moderators[0].id, moderators[2].id, admin.id]
    end
  end
end
