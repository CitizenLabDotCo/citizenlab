# frozen_string_literal: true

require 'rails_helper'

describe InitiativeInternalCommentPolicy do
  subject { described_class.new(user, internal_comment) }

  let(:scope) { InitiativeInternalCommentPolicy::Scope.new(user, initiave.internal_comments) }

  context 'on internal comment on initiave' do
    let(:initiave) { create(:initiative) }
    let(:author) { create(:admin) }
    let!(:internal_comment) { create(:internal_comment, post: initiave, author: author) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it '[error] indexes the internal comment' do
        expect { scope.resolve }.to raise_error(Pundit::NotAuthorizedError, 'not allowed to view this action')
      end
    end

    context 'for a regular user who is not the author of the internal comment' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it '[error] indexes the internal comment' do
        expect { scope.resolve }.to raise_error(Pundit::NotAuthorizedError, 'not allowed to view this action')
      end
    end

    context 'for an admin who is not the author of the internal comment' do
      let(:user) { create(:admin) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal comment' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin who is the author of the internal comment' do
      let(:user) { author }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the internal comment' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
