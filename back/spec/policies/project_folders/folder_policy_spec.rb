# frozen_string_literal: true

require 'rails_helper'

describe ProjectFolders::FolderPolicy do
  subject { described_class.new(user, subject_folder) }

  let(:scope) { described_class::Scope.new(user, ProjectFolders::Folder) }
  let(:inverse_scope) { described_class::InverseScope.new(subject_folder, User) }

  context 'when there\'s a mix of published, and draft folders that include projects' do
    let(:subject_folder) { create(:project_folder, projects: [create(:project)]) }
    let(:draft_folder)     { create(:project_folder, projects: [create(:project)]) }
    let(:archived_folder)  { create(:project_folder, projects: [create(:project)]) }

    before do
      draft_folder.admin_publication.update! publication_status: 'draft'
      subject_folder.admin_publication.update! publication_status: 'published'
      archived_folder.admin_publication.update! publication_status: 'archived'
    end

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder to the visitor' do
        expect(scope.resolve).to include subject_folder
      end

      it 'does not return the draft folder to the visitor' do
        expect(scope.resolve).not_to include draft_folder
      end

      it 'returns the archived folder to the visitor' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when resident' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include subject_folder
      end

      it 'does not return the draft folder to the user' do
        expect(scope.resolve).not_to include draft_folder
      end

      it 'returns the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include subject_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'does not return the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when folder moderator of the folder' do
      let(:user) { create(:project_folder_moderator, project_folders: [subject_folder]) }

      it { is_expected.to permit(:show)        }
      it { is_expected.to permit(:update)      }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include subject_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'returns the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when folder moderator of another folder' do
      let(:user) { create(:project_folder_moderator, project_folders: [create(:project_folder)]) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include subject_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'returns the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when project moderator of a project contained in the folder' do
      let(:project) { create(:project) }
      let(:user) { create(:project_moderator, projects: [project]) }

      before do
        project.admin_publication.update(parent_id: subject_folder.admin_publication.id)
      end

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include subject_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'returns the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when project moderator of a project contained in another folder' do
      let(:project) { create(:project) }
      let(:user) { create(:project_moderator, projects: [project]) }

      before do
        project.admin_publication.update(parent_id: draft_folder.admin_publication.id)
      end

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include subject_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'returns the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end
  end

  context 'when there\'s a folder with a project with group permissions' do
    let(:member) { create(:user) }
    let(:project) { create(:private_groups_project, user: member) }
    let(:subject_folder) { create(:project_folder, projects: [project]) }

    before { subject_folder.admin_publication.update! publication_status: 'published' }

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.to permit(:show) }
    end

    context 'when not member' do
      let(:user) { create(:user) }

      it { is_expected.to permit(:show) }
    end

    context 'when member' do
      let(:user) { member }

      it { is_expected.to permit(:show) }
    end

    context 'when project moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show) }
    end

    context 'when folder moderator' do
      let(:user) { create(:project_folder_moderator, project_folders: [subject_folder]) }

      it { is_expected.to permit(:show) }
    end

    context 'when admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
    end
  end

  context 'when the folder is a draft' do
    let(:project) { create(:project) }
    let(:subject_folder) { create(:project_folder, projects: [project]) }

    before { subject_folder.admin_publication.update! publication_status: 'draft' }

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show) }
    end

    context 'when not member' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
    end

    context 'when project moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.not_to permit(:show) }
    end

    context 'when folder moderator' do
      let(:user) { create(:project_folder_moderator, project_folders: [subject_folder]) }

      it { is_expected.to permit(:show) }
    end

    context 'when admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
    end
  end

  context 'when a published folder is empty' do
    let(:subject_folder) { create(:project_folder, projects: []) }

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
    end
  end

  context 'when a published folder only has draft projects' do
    let(:draft_project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let(:subject_folder) { create(:project_folder, projects: [draft_project]) }

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.to permit(:show) }
    end

    context 'when regular user' do
      let(:user) { create(:user) }

      it { is_expected.to permit(:show) }
    end

    context 'when admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show) }
    end
  end

  context 'when an archived folder is empty' do
    let(:subject_folder) { create(:project_folder, projects: []) }

    before { subject_folder.admin_publication.update! publication_status: 'archived' }

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
    end
  end
end
