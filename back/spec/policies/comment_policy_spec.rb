# frozen_string_literal: true

require 'rails_helper'

describe CommentPolicy do
  subject { described_class.new(user, comment) }

  let(:scope) { CommentPolicy::Scope.new(user, idea.comments) }

  let!(:space) { create(:space) }
  let!(:project) { create(:single_phase_ideation_project, space: space) }
  let!(:folder) { create(:project_folder, projects: [project], space: space) }
  let!(:idea) { create(:idea, project: project, phases: project.phases) }
  let!(:comment) { create(:comment, idea: idea) }
  let!(:user) { create(:user) }

  context 'on comment on idea in a public project' do
    context 'for a user who is not the author of the comment' do
      it { is_expected.to     permit(:show)       }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)       }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is the author of the comment' do
      let(:user) { comment.author }

      it { is_expected.to     permit(:show)       }
      it { is_expected.to     permit(:create)     }
      it { is_expected.to     permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for blocked comment author' do
      let(:user) { create(:user, block_end_at: 5.days.from_now) }
      let(:comment) { create(:comment, author: user, idea: idea) }

      it_behaves_like 'policy for blocked user'
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to permit(:index_xlsx)  }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    shared_examples 'moderator on public idea comment in their scope' do
      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.to     permit(:index_xlsx) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    shared_examples 'moderator on public idea comment outside their scope' do
      it { is_expected.to     permit(:show)       }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.to     permit(:index_xlsx) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a project moderator who can moderate' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it_behaves_like 'moderator on public idea comment in their scope'
    end

    context 'for a project moderator who cannot moderate' do
      let(:user) { create(:project_moderator) }

      it_behaves_like 'moderator on public idea comment outside their scope'
    end

    context 'for a folder moderator who can moderate' do
      let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

      it_behaves_like 'moderator on public idea comment in their scope'
    end

    context 'for a folder moderator who cannot moderate' do
      let(:user) { create(:project_folder_moderator) }

      it_behaves_like 'moderator on public idea comment outside their scope'
    end

    context 'for a space moderator who can moderate' do
      let(:user) { create(:space_moderator, spaces: [space]) }

      it_behaves_like 'moderator on public idea comment in their scope'
    end

    context 'for a space moderator who cannot moderate' do
      let(:user) { create(:space_moderator) }

      it_behaves_like 'moderator on public idea comment outside their scope'
    end
  end

  context 'for a visitor on a comment on an idea in a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }

    it { is_expected.not_to permit(:show)       }
    it { is_expected.not_to permit(:create)     }
    it { is_expected.not_to permit(:update)     }
    it { is_expected.not_to permit(:destroy)    }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'does not index the comment' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a comment on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:project) { create(:private_groups_project) }
    let!(:comment) { create(:comment, idea: idea, author: user) }

    it { is_expected.not_to permit(:show)       }
    it { is_expected.not_to permit(:create)     }
    it { is_expected.not_to permit(:update)     }
    it { is_expected.not_to permit(:destroy)    }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'does not index the comment' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a comment on an idea in a private groups project where she's a member of a manual group with access" do
    let!(:project) { create(:private_groups_project, user: user) }
    let!(:comment) { create(:comment, idea: idea, author: user) }

    it { is_expected.to     permit(:show)       }
    it { is_expected.to     permit(:create)     }
    it { is_expected.to     permit(:update)     }
    it { is_expected.not_to permit(:destroy)    }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'indexes the comment' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for a mortal user who owns the comment in a project where commenting is not permitted' do
    let!(:comment) { create(:comment, idea: idea, author: user) }
    let!(:project) do
      create(:single_phase_budgeting_project, phase_attrs: { with_permissions: true }, space: space).tap do |project|
        project.phases.first.permissions.find_by(action: 'commenting_idea')
          .update!(permitted_by: 'admins_moderators')
      end
    end

    it { is_expected.to     permit(:show)       }
    it { is_expected.not_to permit(:create)     }
    it { is_expected.not_to permit(:update)     }
    it { is_expected.not_to permit(:destroy)    }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'indexes the comment' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
