# frozen_string_literal: true

require 'rails_helper'

describe IdeaFilePolicy do
  subject { described_class.new(user, file) }

  let(:scope) { IdeaFilePolicy::Scope.new(user, idea.idea_files) }

  context 'on a file of an idea in a public project' do
    let(:project) { create(:continuous_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:file) { create(:idea_file, idea: idea) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the file' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is not the idea author' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'indexes the file' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is the idea author' do
      let(:user) { idea.author }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }

      it 'indexes the file' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the file' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on a file of an idea in a private admins project' do
    let(:project) { create(:private_admins_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:file) { create(:idea_file, idea: idea) }

    context 'for a user' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the file' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the file' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
