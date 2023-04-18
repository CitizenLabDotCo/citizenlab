# frozen_string_literal: true

require 'rails_helper'

describe IdeaCommentPolicy do
  subject { described_class.new(user, comment) }

  let(:scope) { IdeaCommentPolicy::Scope.new(user, idea.comments) }

  context 'on comment on idea in a public project' do
    let(:project) { create(:continuous_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is not the author of the comment' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is the author of the comment' do
      let(:user) { comment.author }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for blocked comment author' do
      let(:user) { create(:user, block_end_at: 5.days.from_now) }
      let(:comment) { create(:comment, author: user, post: idea) }

      it_behaves_like 'policy for blocked user'
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the comment' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'for a visitor on a comment on an idea in a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the comment' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a comment on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_project) }
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea) }

    it { is_expected.not_to permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'does not index the comment' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on a comment on an idea in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_continuous_project, user: user) }
    let!(:idea) { create(:idea, project: project) }
    let!(:comment) { create(:comment, post: idea, author: user) }

    it { is_expected.to     permit(:show)    }
    it { is_expected.to     permit(:create)  }
    it { is_expected.to     permit(:update)  }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the comment' do
      expect(scope.resolve.size).to eq 1
    end
  end
end
