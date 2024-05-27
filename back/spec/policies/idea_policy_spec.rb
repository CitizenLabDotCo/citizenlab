# frozen_string_literal: true

require 'rails_helper'

describe IdeaPolicy do
  subject(:policy) { described_class.new(user, idea) }

  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }

  context 'on an idea in a public project' do
    let(:project) { create(:single_phase_ideation_project) }
    let!(:idea) { create(:idea, project: project, phases: project.phases) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to permit(:show)           }
      it { is_expected.to permit(:by_slug)        }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a resident who is not the idea author' do
      let(:user) { create(:user) }

      it { is_expected.to     permit(:show)       }
      it { is_expected.to     permit(:by_slug)    }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a resident who did not complete registration who is the idea author' do
      let :user do
        idea.author.update(registration_completed_at: nil)
        idea.author
      end

      it { is_expected.to     permit(:show)       }
      it { is_expected.to     permit(:by_slug)    }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is the idea author' do
      let(:user) { idea.author }

      it { is_expected.to permit(:show)           }
      it { is_expected.to permit(:by_slug)        }
      it { is_expected.to permit(:create)         }
      it { is_expected.to permit(:update)         }
      it { is_expected.to permit(:destroy)        }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)       }
      it { is_expected.to permit(:by_slug)    }
      it { is_expected.to permit(:create)     }
      it { is_expected.to permit(:update)     }
      it { is_expected.to permit(:destroy)    }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)       }
      it { is_expected.to permit(:create)     }
      it { is_expected.to permit(:update)     }
      it { is_expected.to permit(:destroy)    }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'when there is a posting idea disabled reason' do
      before do
        allow_any_instance_of(Permissions::ProjectPermissionsService)
          .to receive(:denied_reason_for_action).and_return(disabled_reason)
      end

      described_class::EXCLUDED_REASONS_FOR_UPDATE.each do |disabled_reason|
        context "when the disabled reason is excluded for update: '#{disabled_reason}'" do
          let(:disabled_reason) { disabled_reason }

          context 'for an admin' do
            let(:user) { create(:admin) }

            it { is_expected.to permit(:show)       }
            it { is_expected.to permit(:by_slug)    }
            it { is_expected.to permit(:create)     }
            it { is_expected.to permit(:update)     }
            it { is_expected.to permit(:destroy)    }
            it { is_expected.to permit(:index_xlsx) }

            it 'indexes the idea' do
              expect(scope.resolve.size).to eq 1
            end
          end

          context 'for the author' do
            let(:user) { idea.author }

            it { is_expected.to permit(:show)    }
            it { is_expected.to permit(:by_slug) }
            it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
            it { is_expected.to permit(:update)  }
            it { is_expected.to permit(:destroy) }
            it { is_expected.not_to permit(:index_xlsx) }

            it 'indexes the idea' do
              expect(scope.resolve.size).to eq 1
            end
          end
        end
      end

      context "when the disabled reason is not excluded for update: 'not_ideation'" do
        let(:disabled_reason) { 'not_ideation' }

        context 'for an admin' do
          let(:user) { create(:admin) }

          it { is_expected.to permit(:show)       }
          it { is_expected.to permit(:by_slug)    }
          it { is_expected.to permit(:create)     }
          it { is_expected.to permit(:update)     }
          it { is_expected.to permit(:destroy)    }
          it { is_expected.to permit(:index_xlsx) }

          it 'indexes the idea' do
            expect(scope.resolve.size).to eq 1
          end
        end

        context 'for the author' do
          let(:user) { idea.author }

          it { is_expected.to permit(:show)    }
          it { is_expected.to permit(:by_slug) }
          it { is_expected.not_to permit(:index_xlsx) }
          it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
          it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
          it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

          it 'indexes the idea' do
            expect(scope.resolve.size).to eq 1
          end
        end
      end
    end
  end

  context 'on idea in a private admins project' do
    let(:project) { create(:private_admins_project) }
    let!(:idea) { create(:idea, project: project) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)       }
      it { is_expected.not_to permit(:by_slug)    }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the idea' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:by_slug) }
      it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the idea' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)       }
      it { is_expected.to permit(:by_slug)    }
      it { is_expected.to permit(:create)     }
      it { is_expected.to permit(:update)     }
      it { is_expected.to permit(:destroy)    }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it { is_expected.to permit(:show)       }
      it { is_expected.to permit(:create)     }
      it { is_expected.to permit(:update)     }
      it { is_expected.to permit(:destroy)    }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'for a visitor on an idea in a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }

    it { is_expected.not_to permit(:show)       }
    it { is_expected.not_to permit(:by_slug)    }
    it { is_expected.not_to permit(:create)     }
    it { is_expected.not_to permit(:update)     }
    it { is_expected.not_to permit(:destroy)    }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'does not index the idea' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }

    it { is_expected.not_to permit(:show) }
    it { is_expected.not_to permit(:by_slug) }
    it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
    it { is_expected.not_to permit(:update)  }
    it { is_expected.not_to permit(:destroy) }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'does not index the idea' do
      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user) }
    let!(:idea) { create(:idea, project: project) }

    it { is_expected.to permit(:show)           }
    it { is_expected.to permit(:by_slug)        }
    it { is_expected.not_to permit(:create)     }
    it { is_expected.not_to permit(:update)     }
    it { is_expected.not_to permit(:destroy)    }
    it { is_expected.not_to permit(:index_xlsx) }

    it 'indexes the idea' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for an admin on an idea in a private groups project' do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }

    it { is_expected.to permit(:show)       }
    it { is_expected.to permit(:by_slug)    }
    it { is_expected.to permit(:create)     }
    it { is_expected.to permit(:update)     }
    it { is_expected.to permit(:destroy)    }
    it { is_expected.to permit(:index_xlsx) }

    it 'indexes the idea' do
      expect(scope.resolve.size).to eq 1
    end
  end

  context 'on idea in a draft project' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.not_to permit(:show)       }
      it { is_expected.not_to permit(:by_slug)    }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the idea' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it { is_expected.not_to permit(:show) }
      it { is_expected.not_to permit(:by_slug) }
      it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
      it { is_expected.not_to permit(:update)  }
      it { is_expected.not_to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the idea' do
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)       }
      it { is_expected.to permit(:by_slug)    }
      it { is_expected.to permit(:create)     }
      it { is_expected.to permit(:update)     }
      it { is_expected.to permit(:destroy)    }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on idea for a budgeting project' do
    let(:project) { create(:single_phase_budgeting_project) }
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to permit(:show)           }
      it { is_expected.to permit(:by_slug)        }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for the author' do
      let(:user) { author }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:by_slug) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
      it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
      it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)       }
      it { is_expected.to permit(:by_slug)    }
      it { is_expected.to permit(:create)     }
      it { is_expected.to permit(:update)     }
      it { is_expected.to permit(:destroy)    }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on idea for a project of which the last phase has ended' do
    let(:project) do
      create(:project_with_current_phase, phases_config: { sequence: 'xxc' }).tap do |project|
        project.phases.max_by(&:start_at).destroy!
      end.reload
    end
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author, phases: project.phases) }

    context 'for a visitor' do
      let(:user) { nil }

      it { is_expected.to permit(:show)           }
      it { is_expected.to permit(:by_slug)        }
      it { is_expected.not_to permit(:create)     }
      it { is_expected.not_to permit(:update)     }
      it { is_expected.not_to permit(:destroy)    }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'does not index the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for the author' do
      let(:user) { author }

      it { is_expected.to permit(:show) }
      it { is_expected.to permit(:by_slug) }
      it { is_expected.not_to permit(:index_xlsx) }
      it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
      it { expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError) }
      it { expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it { is_expected.to permit(:show)       }
      it { is_expected.to permit(:by_slug)    }
      it { is_expected.to permit(:create)     }
      it { is_expected.to permit(:update)     }
      it { is_expected.to permit(:destroy)    }
      it { is_expected.to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'for blocked author' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:idea) { create(:idea, author: user, project: create(:single_phase_ideation_project)) }

    it_behaves_like 'policy for blocked user'
  end

  # It appears we actually create an idea when a user submits a native survey
  context 'for blocked user submitting a survey' do
    let(:user) { create(:user, block_end_at: 5.days.from_now) }
    let(:idea) { create(:idea, author: user, project: create(:single_phase_typeform_survey_project)) }

    it_behaves_like 'policy for blocked user'
  end

  context 'with phase permissions' do
    let(:author) { create(:user) }
    let(:permitted_by) { 'admins_moderators' }
    let(:participation_method) { 'ideation' }
    let(:posting_enabled) { true }
    let(:project) do
      create(:single_phase_ideation_project, phase_attrs: {
        with_permissions: true,
        posting_enabled: posting_enabled,
        participation_method: participation_method,
        native_survey_title_multiloc: { 'en' => 'Survey' },
        native_survey_button_multiloc: { 'en' => 'Take the survey' }
      }).tap do |project|
        project.phases.first.permissions.find_by(action: 'posting_idea').update!(permitted_by: permitted_by)
      end
    end
    let!(:idea) do
      IdeaStatus.create_defaults
      phase = project.phases.first
      create(:idea, project: project, author: author, creation_phase: phase.native_survey? ? phase : nil)
    end

    context "for a visitor with posting permissions granted to 'everyone'" do
      let(:user) { nil }
      let(:permitted_by) { 'everyone' }

      describe 'in a participation method where everyone can post' do
        let(:participation_method) { 'native_survey' }

        it { is_expected.not_to permit(:show)       }
        it { is_expected.to permit(:create)         }
        it { is_expected.not_to permit(:update)     }
        it { is_expected.not_to permit(:destroy)    }
        it { is_expected.not_to permit(:index_xlsx) }
      end

      describe 'in a participation method where sign-in is required to post' do
        let(:participation_method) { 'ideation' }

        it { is_expected.to permit(:show)           }
        it { is_expected.not_to permit(:create)     }
        it { is_expected.not_to permit(:update)     }
        it { is_expected.not_to permit(:destroy)    }
        it { is_expected.not_to permit(:index_xlsx) }

        it 'indexes the idea' do
          expect(scope.resolve.size).to eq 1
        end
      end
    end

    context 'for the author of an idea in a project where posting is not permitted' do
      let(:user) { author }
      let(:posting_enabled) { false }

      it { is_expected.to permit(:show) }
      it { expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError) }
      it { is_expected.to permit(:update) }
      it { is_expected.to permit(:destroy) }
      it { is_expected.not_to permit(:index_xlsx) }

      it 'indexes the idea' do
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
