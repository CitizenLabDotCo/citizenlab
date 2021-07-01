# frozen_string_literal: true

require 'rails_helper'

describe IdeaFilePolicy do
  subject { described_class.new(user, file) }

  let(:scope) { IdeaFilePolicy::Scope.new(user, idea.idea_files) }

  context 'on a file of an idea in a public project' do
    let(:project) { create(:continuous_project) }
    let(:idea) { create(:idea, project: project) }
    let!(:file) { create(:idea_file, idea: idea) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

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
