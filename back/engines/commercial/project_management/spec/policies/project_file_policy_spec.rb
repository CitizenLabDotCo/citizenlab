# frozen_string_literal: true

require 'rails_helper'

describe ProjectFilePolicy do
  subject { described_class.new(user, file) }

  let(:scope) { ProjectFilePolicy::Scope.new(user, project.project_files) }

  context 'on a file in a public project' do
    let(:project) { create(:continuous_project) }
    let!(:file) { create(:project_file, project: project) }

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
