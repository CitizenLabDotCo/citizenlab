# frozen_string_literal: true

require 'rails_helper'

describe ActivityPolicy do
  subject(:policy) { described_class.new(user, activity) }

  let(:scope) { described_class::Scope.new(user, Activity) }

  context 'on an activity for the management feed' do
    let!(:activity) { create(:phase_created_activity, user: create(:admin)) }

    context 'for a visitor' do
      let(:user) { nil }

      it 'does not index the activity' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it 'does not index the activity' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a project moderator (who is not an admin)' do
      let(:project) { create(:project) }
      let(:user) { create(:project_moderator, projects: [project]) }

      it 'does not index the activity' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it 'indexes the activity' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on an activity NOT for the management feed' do
    let!(:activity) { create(:comment_created_activity) }

    context 'for a visitor' do
      let(:user) { nil }

      it 'does not index the activity' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it 'does not index the activity' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a project moderator (who is not an admin)' do
      let(:project) { create(:project) }
      let(:user) { create(:project_moderator, projects: [project]) }

      it 'does not index the activity' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it 'does not index the activity' do
        expect(scope.resolve.size).to eq 0
      end
    end
  end
end
