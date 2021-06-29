# frozen_string_literal: true

require 'rails_helper'

describe ProjectImagePolicy do
  subject { described_class.new(user, image) }

  let(:scope) { ProjectImagePolicy::Scope.new(user, project.project_images) }

  context 'on an image in a public project' do
    let(:project) { create(:continuous_project) }
    let!(:image) { create(:project_image, project: project) }

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'indexes the image' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
