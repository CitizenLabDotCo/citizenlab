require 'rails_helper'

describe InputTopicPolicy do
  subject { described_class.new(user, input_topic) }

  let(:scope) { InputTopicPolicy::Scope.new(user, InputTopic) }

  let!(:space) { create(:space) }
  let!(:project) { create(:project, space: space) }
  let!(:folder) { create(:project_folder, projects: [project], space: space) }
  let!(:input_topic) { create(:input_topic, project: project) }

  shared_examples 'can moderate the input topic' do
    it { is_expected.to permit(:show)    }
    it { is_expected.to permit(:create)  }
    it { is_expected.to permit(:update)  }
    it { is_expected.to permit(:move)    }
    it { is_expected.to permit(:destroy) }

    it 'indexes the input topic' do
      expect(scope.resolve).to include(input_topic)
    end
  end

  shared_examples 'cannot moderate the input topic' do
    it { is_expected.to     permit(:show)    }
    it { is_expected.not_to permit(:create)  }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:move)    }
    it { is_expected.not_to permit(:destroy) }

    it 'indexes the input topic' do
      expect(scope.resolve).to include(input_topic)
    end
  end

  context 'for a visitor' do
    let(:user) { nil }

    it_behaves_like 'cannot moderate the input topic'
  end

  context 'for a resident' do
    let(:user) { create(:user) }

    it_behaves_like 'cannot moderate the input topic'
  end

  context 'for an admin' do
    let(:user) { create(:admin) }

    it_behaves_like 'can moderate the input topic'
  end

  context 'for a project moderator who can moderate' do
    let(:user) { create(:project_moderator, projects: [project]) }

    it_behaves_like 'can moderate the input topic'
  end

  context 'for a project moderator who cannot moderate' do
    let(:user) { create(:project_moderator) }

    it_behaves_like 'cannot moderate the input topic'
  end

  context 'for a folder moderator who can moderate' do
    let(:user) { create(:project_folder_moderator, project_folders: [folder]) }

    it_behaves_like 'can moderate the input topic'
  end

  context 'for a folder moderator who cannot moderate' do
    let(:user) { create(:project_folder_moderator) }

    it_behaves_like 'cannot moderate the input topic'
  end

  context 'for a space moderator who can moderate' do
    let(:user) { create(:space_moderator, spaces: [space]) }

    it_behaves_like 'can moderate the input topic'
  end

  context 'for a space moderator who cannot moderate' do
    let(:user) { create(:space_moderator) }

    it_behaves_like 'cannot moderate the input topic'
  end
end
