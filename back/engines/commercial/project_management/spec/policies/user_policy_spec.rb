# frozen_string_literal: true

require 'rails_helper'

describe UserPolicy do
  subject { described_class.new(current_user, subject_user) }

  let(:scope) { UserPolicy::Scope.new(current_user, User) }

  context 'for a moderator' do
    let(:project) { create(:project) }
    let(:current_user) { create(:project_moderator, projects: [project]) }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }
      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the user through the scope' do
        subject_user.save
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'on someone else' do
      let(:subject_user) { create(:user) }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the users through the scope' do
        subject_user.save
        expect(scope.resolve.size).to eq 2
      end
    end
  end
end
