# frozen_string_literal: true

require 'rails_helper'

describe IdeaInternalCommentPolicy do
  subject { described_class.new(user, comment) }

  let(:scope) { IdeaInternalCommentPolicy::Scope.new(user, idea.internal_comments) }

  context 'on internal_comment on idea in a public project' do
    let(:project) { create(:continuous_project) }
    let(:idea) { create(:idea, project: project) }
    let(:author) { create(:admin) }
    let!(:comment) { create(:internal_comment, post: idea, author: author) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal_comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is not the author of the internal_comment' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal_comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is the author of the comment' do
      let(:user) { author }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal_comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal_comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator who is not author of the internal_comment' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal_comment' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  # Add test(s) of folder moderator?

  context 'on internal_comment, authored by project moderator on idea in a public project' do
    let(:project) { create(:continuous_project) }
    let(:idea) { create(:idea, project: project) }
    let(:author) { create(:project_moderator, projects: [project]) }
    let!(:comment) { create(:internal_comment, post: idea, author: author) }

    context 'for a moderator who is the author of the internal_comment' do
      let(:user) { author }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal_comment' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
