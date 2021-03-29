require 'rails_helper'

describe ProjectFolders::FolderPolicy do
  subject { described_class.new(user, published_folder) }

  let(:scope) { described_class::Scope.new(user, ProjectFolders::Folder) }
  let(:inverse_scope) { described_class::InverseScope.new(published_folder, User) }

  context 'when there\'s a mix of published, and draft folders' do
    let(:published_folder) { create(:project_folder) }
    let(:draft_folder)     { create(:project_folder) }
    let(:archived_folder)  { create(:project_folder) }

    before do
      draft_folder.admin_publication.update(publication_status: 'draft')
      published_folder.admin_publication.update(publication_status: 'published')
      archived_folder.admin_publication.update(publication_status: 'archived')
    end

    context 'when visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder to the visitor' do
        expect(scope.resolve).to include published_folder
      end

      it 'does not return the draft folder to the visitor' do
        expect(scope.resolve).not_to include draft_folder
      end

      it 'returns the archived folder to the visitor' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when user' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include published_folder
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
        expect(scope.resolve).to include published_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'does not return the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when folder moderator of the folder' do
      let(:user) { create(:project_folder_moderator, project_folder: published_folder) }

      it { is_expected.to permit(:show)        }
      it { is_expected.to permit(:update)      }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include published_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'returns the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end

    context 'when folder moderator of another folder' do
      let(:user) { create(:project_folder_moderator, project_folder: create(:project_folder)) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include published_folder
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
      let(:user) { create(:moderator, project: project) }

      before do
        project.admin_publication.update(parent_id: published_folder.admin_publication.id)
      end

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include published_folder
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
      let(:user) { create(:moderator, project: project) }

      before do
        project.admin_publication.update(parent_id: draft_folder.admin_publication.id)
      end

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'returns the published folder' do
        expect(scope.resolve).to include published_folder
      end

      it 'returns the draft folder to the user' do
        expect(scope.resolve).to include draft_folder
      end

      it 'returns the archived folder to the user' do
        expect(scope.resolve).to include archived_folder
      end
    end
  end
end
