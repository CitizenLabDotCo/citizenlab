# frozen_string_literal: true

require 'rails_helper'

describe StaticPagePolicy do
  subject(:policy) { described_class.new(user_context, page) }

  let(:scope) { StaticPagePolicy::Scope.new(user_context, StaticPage) }
  let(:user_context) { ApplicationPolicy::UserContext.new(user, {}) }

  context 'on a global (projectless) page' do
    let!(:page) { create(:static_page) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)   }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }

      it 'is included in the scope' do
        expect(scope.resolve).to include(page)
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }
    end

    context 'for a project moderator' do
      let(:user) { create(:project_moderator) }

      it { is_expected.to     permit(:show)   }
      it { is_expected.not_to permit(:create) }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }
    end
  end

  context 'on a page of a published project' do
    let(:project) { create(:project) }
    let!(:page) { create(:static_page, project: project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to     permit(:show)   }
      it { is_expected.not_to permit(:update) }

      it 'is included in the scope' do
        expect(scope.resolve).to include(page)
      end
    end

    context 'for a moderator of the page\'s project' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)    }
      it { is_expected.to permit(:create)  }
      it { is_expected.to permit(:update)  }
      it { is_expected.to permit(:destroy) }

      it 'cannot reassign the page to a different project' do
        page.project = create(:project)
        expect(policy).not_to permit(:update)
      end
    end

    context 'for a moderator of a different project' do
      let(:user) { create(:project_moderator, projects: [create(:project)]) }

      it { is_expected.to     permit(:show)   }
      it { is_expected.not_to permit(:update) }
      it { is_expected.not_to permit(:destroy) }

      it 'cannot create a page for a project it does not moderate' do
        expect(policy).not_to permit(:create)
      end
    end
  end

  context 'on a page of a draft project' do
    let(:project) { create(:project, :draft) }
    let!(:page) { create(:static_page, project: project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show) }

      it 'is excluded from the scope' do
        expect(scope.resolve).not_to include(page)
      end
    end

    context 'for a moderator of the page\'s project' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)   }
      it { is_expected.to permit(:update) }

      it 'is included in the scope' do
        expect(scope.resolve).to include(page)
      end
    end
  end
end
