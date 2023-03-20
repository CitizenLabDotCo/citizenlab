# frozen_string_literal: true

require 'rails_helper'

describe InitiativeCommentPolicy do
  subject { described_class.new(user, comment) }

  let(:scope) { InitiativeCommentPolicy::Scope.new(user, initiave.comments) }

  context 'on comment on initiave' do
    let(:initiave) { create(:initiative) }
    let!(:comment) { create(:comment, post: initiave) }

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
      let(:comment) { create(:comment, author: user, post: initiave) }

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
  end
end
