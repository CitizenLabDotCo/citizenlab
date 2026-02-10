# frozen_string_literal: true

require 'rails_helper'

describe GroupPolicy do
  subject { described_class.new(user, group) }

  let(:scope) { GroupPolicy::Scope.new(user, Group) }

  context 'on normal group' do
    let!(:group) { create(:group) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the group' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show)    }
      it { is_expected.not_to permit(:create)  }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }

      it 'does not index the group' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to    permit(:show)    }
      it { is_expected.to    permit(:create)  }
      it { is_expected.to    permit(:update)  }
      it { is_expected.to    permit(:destroy) }

      it 'indexes the group' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a project moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      context 'of a public project' do
        let(:project) { create(:project) }

        it { is_expected.to     permit(:show)    }
        it { is_expected.not_to permit(:create)  }
        it { is_expected.not_to permit(:update)  }
        it { is_expected.not_to permit(:destroy) }

        it 'indexes the group' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'of a private admins project' do
        let(:project) { create(:private_admins_project) }

        it { is_expected.not_to permit(:show)    }
        it { is_expected.not_to permit(:create)  }
        it { is_expected.not_to permit(:update)  }
        it { is_expected.not_to permit(:destroy) }

        it 'does not index the group' do
          expect(scope.resolve.size).to eq 0
        end
      end

      context 'of a private groups project with the group' do
        let(:project) { create(:private_groups_project) }

        before do
          project.update(groups: [group])
        end

        it { is_expected.to permit(:show) }
        it { is_expected.not_to permit(:create)  }
        it { is_expected.not_to permit(:update)  }
        it { is_expected.not_to permit(:destroy) }

        it 'indexes the group' do
          expect(scope.resolve.size).to eq 1
        end
      end

      context 'of a private groups project with another group' do
        let(:project) { create(:private_groups_project) }

        it { is_expected.not_to permit(:show)    }
        it { is_expected.not_to permit(:create)  }
        it { is_expected.not_to permit(:update)  }
        it { is_expected.not_to permit(:destroy) }

        it 'indexes the other group only' do
          expect(scope.resolve.ids).to eq [project.groups.first.id]
        end
      end
    end
  end
end
