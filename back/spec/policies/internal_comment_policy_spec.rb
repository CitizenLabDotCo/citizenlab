# frozen_string_literal: true

require 'rails_helper'

describe InternalCommentPolicy do
  subject { described_class.new(user, internal_comment) }

  let(:scope) { InternalCommentPolicy::Scope.new(user, idea.internal_comments) }

  context 'on internal comment by an admin on idea in a public project' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:idea) { create(:idea, project: project) }
    let(:author) { create(:admin) }
    let!(:internal_comment) { create(:internal_comment, idea: idea, author: author) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }

      it '[error] indexes the internal comment' do
        expect { scope.resolve }.to raise_error(Pundit::NotAuthorizedError, 'not allowed to view this action')
      end
    end

    context 'for a regular user who is not the author of the internal comment' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }

      it '[error] indexes the internal comment' do
        expect { scope.resolve }.to raise_error(Pundit::NotAuthorizedError, 'not allowed to view this action')
      end
    end

    context 'for the admin who is the author of the internal comment' do
      let(:user) { author }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }

      it 'indexes the internal comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin who is not the author of the internal comment' do
      let(:user) { create(:admin) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.not_to permit(:update)  }

      it 'indexes the internal comment' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on internal comment by a moderator on idea in a public project' do
    let!(:space) { create(:space) }
    let(:project) { create(:single_phase_ideation_project, space: space) }
    let!(:folder) { create(:project_folder, projects: [project], space: space) }
    let(:idea) { create(:idea, project: project) }
    let(:author) { create(:project_moderator, projects: [project]) }
    let!(:internal_comment) { create(:internal_comment, idea: idea, author: author) }

    shared_examples 'moderator who is the comment author' do
      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }

      it 'indexes the internal comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    shared_examples 'moderator who can moderate but is not the author' do
      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.not_to permit(:update)  }

      it 'indexes the internal comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    shared_examples 'moderator who cannot moderate the project' do
      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }

      it 'does not include comment when indexing internal comments' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a project moderator who is author of the internal comment' do
      let(:author) { create(:project_moderator, projects: [project]) }
      let(:user) { author }

      it_behaves_like 'moderator who is the comment author'
    end

    context 'for a project moderator who can moderate but is not the author' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it_behaves_like 'moderator who can moderate but is not the author'
    end

    context 'for a project moderator who cannot moderate the project' do
      let(:user) { create(:project_moderator) }

      it_behaves_like 'moderator who cannot moderate the project'
    end

    context 'for a folder moderator who is author of the internal comment' do
      let(:author) { create(:project_folder_moderator, project_folders: [folder]) }
      let(:user) { author }

      it_behaves_like 'moderator who is the comment author'
    end

    context 'for a folder moderator who can moderate but is not the author' do
      let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

      it_behaves_like 'moderator who can moderate but is not the author'
    end

    context 'for a folder moderator who cannot moderate the project' do
      let(:user) { create(:project_folder_moderator) }

      it_behaves_like 'moderator who cannot moderate the project'
    end

    context 'for a space moderator who is author of the internal comment' do
      let(:author) { create(:space_moderator, spaces: [space]) }
      let(:user) { author }

      it_behaves_like 'moderator who is the comment author'
    end

    context 'for a space moderator who can moderate but is not the author' do
      let(:user) { create(:space_moderator, spaces: [space]) }

      it_behaves_like 'moderator who can moderate but is not the author'
    end

    context 'for a space moderator who cannot moderate the project' do
      let(:user) { create(:space_moderator) }

      it_behaves_like 'moderator who cannot moderate the project'
    end
  end
end
