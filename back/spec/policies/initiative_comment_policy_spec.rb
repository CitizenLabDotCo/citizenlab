# frozen_string_literal: true

require 'rails_helper'

describe InitiativeCommentPolicy do
  subject { described_class.new(user, comment) }

  let(:scope) { InitiativeCommentPolicy::Scope.new(user, initiative.comments) }

  context 'on comment on initiative with proposed status' do
    let(:initiative) { create(:initiative) }

    let!(:_initiative_status_change) do
      create(
        :initiative_status_change,
        initiative: initiative,
        initiative_status: create(:initiative_status_proposed)
      )
    end

    let!(:comment) { create(:comment, post: initiative) }

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
      let(:comment) { create(:comment, author: user, post: initiative) }

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

  context 'on comment on initiative with review_pending status' do
    let(:initiative) { create(:initiative) }

    let!(:_initiative_status_change) do
      create(
        :initiative_status_change,
        initiative: initiative,
        initiative_status: create(:initiative_status_review_pending)
      )
    end

    let!(:comment) { create(:comment, post: initiative, author: initiative.author) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the comment' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a user who is not the author of the initiative or the comment' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the comment' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a user who is the author of the initiative and the comment' do
      let(:user) { initiative.author }

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
      let(:comment) { create(:comment, author: user, post: initiative) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the comment' do
        expect(scope.resolve.size).to eq 0
      end
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

    context 'for a user who is cosponsor of the initiative' do
      let(:user) { create(:user) }
      let!(:cosponsors_initiative) { create(:cosponsors_initiative, user: user, initiative: initiative) }

      it { is_expected.to permit(:show) }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the initiative' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
