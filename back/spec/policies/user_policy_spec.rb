# frozen_string_literal: true

require 'rails_helper'

describe UserPolicy do
  subject { described_class.new current_user, subject_user }

  let(:scope) { UserPolicy::Scope.new current_user, User }

  context 'for a visitor' do
    let(:current_user) { nil }
    let(:subject_user) { create :user }

    it { is_expected.to     permit(:show)    }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:index) }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'should not index the user through the scope' do
      subject_user.save!
      expect(scope.resolve.size).to eq 0
    end
  end

  context 'for a user' do
    let(:current_user) { create :user }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.to     permit(:update)  }
      it { is_expected.to     permit(:destroy) }
      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'should not index the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'on someone else' do
      let(:subject_user) { create :user }

      it { is_expected.to     permit(:show)    }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'should index the users through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 0
      end
    end
  end

  context 'for an admin' do
    let(:current_user) { create :admin }

    context 'on theirself' do
      let(:subject_user) { current_user }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:index) }
      it { is_expected.to permit(:index_xlsx) }

      it 'should index the user through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'on someone else' do
      let(:subject_user) { create :user }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }
      it { is_expected.to permit(:index) }
      it { is_expected.to permit(:index_xlsx) }

      it 'should index the users through the scope' do
        subject_user.save!
        expect(scope.resolve.size).to eq 2
      end
    end
  end
end
