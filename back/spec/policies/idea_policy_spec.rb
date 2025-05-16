# frozen_string_literal: true

require 'rails_helper'

describe IdeaPolicy do
  subject(:policy) { described_class.new(user, idea) }

  let(:scope) { IdeaPolicy::Scope.new(user, project.ideas) }
  let(:editing_idea_disabled_reason) { Permissions::IdeaPermissionsService.new(idea, user).denied_reason_for_action('editing_idea') }

  context 'on an idea in a public project' do
    let(:project) { create(:single_phase_ideation_project) }
    let!(:idea) { create(:idea, project: project, phases: project.phases) }

    context 'for a visitor' do
      let(:user) { nil }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a resident who is not the idea author' do
      let(:user) { create(:user) }

      it do
        is_expected.to     permit(:show)
        is_expected.to     permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a resident who did not complete registration who is the idea author' do
      let :user do
        idea.author.update(registration_completed_at: nil)
        idea.author
      end

      it do
        is_expected.to     permit(:show)
        is_expected.to     permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a user who is the idea author' do
      let(:user) { idea.author }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'when there is a posting idea disabled reason' do
      %w[posting_disabled posting_limited_max_reached].each do |disabled_reason|
        context "when the disabled reason is excluded for update: '#{disabled_reason}'" do
          before do
            case disabled_reason
            when 'posting_disabled'
              project.phases.first.update!(submission_enabled: false)
            when 'posting_limited_max_reached'
              create(:idea, project: idea.project, author: idea.author)
              allow_any_instance_of(ParticipationMethod::Ideation)
                .to receive(:allow_posting_again_after).and_return(nil)
            end
          end

          context 'for an admin' do
            let(:user) { create(:admin) }

            it do
              is_expected.to permit(:show)
              is_expected.to permit(:by_slug)
              is_expected.to permit(:create)
              is_expected.to permit(:update)
              expect(editing_idea_disabled_reason).to be_nil
              is_expected.to permit(:destroy)
              is_expected.to permit(:index_xlsx)

              expect(scope.resolve.size).to eq project.ideas.count
            end
          end

          context 'for the author' do
            let(:user) { idea.author }

            it do
              is_expected.to permit(:show)
              is_expected.to permit(:by_slug)
              expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
              is_expected.to permit(:update)
              expect(editing_idea_disabled_reason).to be_nil
              is_expected.to permit(:destroy)
              is_expected.not_to permit(:index_xlsx)

              expect(scope.resolve.size).to eq project.ideas.count
            end

            context 'when the idea is going to be published' do
              before do
                idea.update!(publication_status: 'draft')
                idea.publication_status = 'published'
              end

              it "doesn't allow to create/update idea" do
                expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
                expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError)
              end
            end
          end
        end
      end
    end

    context "when the disabled reason is not excluded for update: 'posting_not_supported'" do
      before do
        allow_any_instance_of(Permissions::ProjectPermissionsService)
          .to receive(:denied_reason_for_action).and_return('posting_not_supported')
      end

      context 'for an admin' do
        let(:user) { create(:admin) }

        it do
          is_expected.to permit(:show)
          is_expected.to permit(:by_slug)
          is_expected.to permit(:create)
          is_expected.to permit(:update)
          expect(editing_idea_disabled_reason).to be_nil
          is_expected.to permit(:destroy)
          is_expected.to permit(:index_xlsx)

          expect(scope.resolve.size).to eq 1
        end
      end

      context 'for the author' do
        let(:user) { idea.author }

        it do
          is_expected.to permit(:show)
          is_expected.to permit(:by_slug)
          is_expected.not_to permit(:index_xlsx)
          expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
          expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError)
          expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError)

          expect(scope.resolve.size).to eq 1
        end
      end
    end
  end

  context 'on a published native survey response in a public project' do
    let!(:proposed_status) { create(:idea_status_proposed) }
    let(:idea) { create(:native_survey_response) }
    let(:project) { idea.project }

    context 'for a visitor' do
      let(:user) { nil }

      it do
        is_expected.not_to permit(:show)
        is_expected.not_to permit(:by_slug)
        is_expected.not_to permit(:update)
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident who is not the response author' do
      let(:user) { create(:user) }

      it do
        is_expected.not_to     permit(:show)
        is_expected.not_to     permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident who is the response author' do
      let(:user) { idea.author }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.not_to permit(:update)
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end

      context 'with an unsaved idea' do
        let(:project) { create(:project_with_active_native_survey_phase) }
        let(:user) { create(:user) }
        let(:idea) { build(:native_survey_response, project:, author: user) }

        it do
          is_expected.to permit(:create)
        end
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.to permit(:create)
        is_expected.not_to permit(:update)
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:create)
        is_expected.not_to permit(:update)
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on idea in a private admins project' do
    let(:project) { create(:private_admins_project) }
    let!(:idea) { create(:idea, project: project) }

    context 'for a visitor' do
      let(:user) { nil }

      it do
        is_expected.not_to permit(:show)
        is_expected.not_to permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it do
        is_expected.not_to permit(:show)
        is_expected.not_to permit(:by_slug)
        expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for a moderator' do
      let(:user) { create(:project_moderator, projects: [project]) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'for a visitor on an idea in a private groups project' do
    let!(:user) { nil }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }

    it do
      is_expected.not_to permit(:show)
      is_expected.not_to permit(:by_slug)
      is_expected.not_to permit(:create)
      is_expected.not_to permit(:update)
      expect(editing_idea_disabled_reason).to be_present
      is_expected.not_to permit(:destroy)
      is_expected.not_to permit(:index_xlsx)

      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's not member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }

    it do
      is_expected.not_to permit(:show)
      is_expected.not_to permit(:by_slug)
      expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
      is_expected.not_to permit(:update)
      expect(editing_idea_disabled_reason).to be_present
      is_expected.not_to permit(:destroy)
      is_expected.not_to permit(:index_xlsx)

      expect(scope.resolve.size).to eq 0
    end
  end

  context "for a user on an idea in a private groups project where she's a member of a manual group with access" do
    let!(:user) { create(:user) }
    let!(:project) { create(:private_groups_project, user: user) }
    let!(:idea) { create(:idea, project: project) }

    it do
      is_expected.to permit(:show)
      is_expected.to permit(:by_slug)
      is_expected.not_to permit(:create)
      is_expected.not_to permit(:update)
      expect(editing_idea_disabled_reason).to be_present
      is_expected.not_to permit(:destroy)
      is_expected.not_to permit(:index_xlsx)

      expect(scope.resolve.size).to eq 1
    end
  end

  context 'for an admin on an idea in a private groups project' do
    let!(:user) { create(:admin) }
    let!(:project) { create(:private_groups_project) }
    let!(:idea) { create(:idea, project: project) }

    it do
      is_expected.to permit(:show)
      is_expected.to permit(:by_slug)
      is_expected.to permit(:create)
      is_expected.to permit(:update)
      expect(editing_idea_disabled_reason).to be_nil
      is_expected.to permit(:destroy)
      is_expected.to permit(:index_xlsx)

      expect(scope.resolve.size).to eq 1
    end
  end

  context 'on idea in a draft project' do
    let(:project) { create(:project, admin_publication_attributes: { publication_status: 'draft' }) }
    let(:author) { create(:user) }
    let!(:idea) { create(:idea, project: project, author: author) }

    context 'for a visitor' do
      let(:user) { nil }

      it do
        is_expected.not_to permit(:show)
        is_expected.not_to permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a resident' do
      let(:user) { create(:user) }

      it do
        is_expected.not_to permit(:show)
        is_expected.not_to permit(:by_slug)
        expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present
        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

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

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present

        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for the author' do
      let(:user) { author }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.not_to permit(:index_xlsx)
        expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
        expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError)
        expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

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

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.not_to permit(:create)
        is_expected.not_to permit(:update)
        expect(editing_idea_disabled_reason).to be_present

        is_expected.not_to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for the author' do
      let(:user) { author }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.not_to permit(:index_xlsx)
        expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
        expect { policy.update? }.to raise_error(Pundit::NotAuthorizedError)
        expect { policy.destroy? }.to raise_error(Pundit::NotAuthorizedError)

        expect(scope.resolve.size).to eq 1
      end
    end

    context 'for an admin' do
      let(:user) { create(:admin) }

      it do
        is_expected.to permit(:show)
        is_expected.to permit(:by_slug)
        is_expected.to permit(:create)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.to permit(:index_xlsx)

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
    let(:submission_enabled) { true }
    let(:project) do
      create(:single_phase_ideation_project, phase_attrs: {
        with_permissions: true,
        submission_enabled: submission_enabled,
        participation_method: participation_method,
        native_survey_title_multiloc: { 'en' => 'Survey' },
        native_survey_button_multiloc: { 'en' => 'Take the survey' }
      }).tap do |project|
        project.phases.first.permissions.find_by(action: 'posting_idea').update!(permitted_by: permitted_by)
      end
    end
    let!(:idea) do
      create(:idea_status_proposed)
      phase = project.phases.first
      create(:idea, project: project, author: author, creation_phase: phase.pmethod.supports_survey_form? ? phase : nil)
    end

    context "for a visitor with posting permissions granted to 'everyone'" do
      let(:user) { nil }
      let(:permitted_by) { 'everyone' }

      describe 'in a participation method where everyone can post' do
        let(:participation_method) { 'native_survey' }

        it do
          is_expected.not_to permit(:show)
          is_expected.to permit(:create)
          is_expected.not_to permit(:update)
          expect(editing_idea_disabled_reason).to be_present
          is_expected.not_to permit(:destroy)
          is_expected.not_to permit(:index_xlsx)
        end
      end

      describe 'in a participation method where sign-in is required to post' do
        let(:participation_method) { 'ideation' }

        it do
          is_expected.to permit(:show)
          is_expected.not_to permit(:create)
          is_expected.not_to permit(:update)
          expect(editing_idea_disabled_reason).to be_present
          is_expected.not_to permit(:destroy)
          is_expected.not_to permit(:index_xlsx)

          expect(scope.resolve.size).to eq 1
        end
      end
    end

    context 'for the author of an idea in a project where posting is not permitted' do
      let(:user) { author }
      let(:submission_enabled) { false }

      it do
        is_expected.to permit(:show)
        expect { policy.create? }.to raise_error(Pundit::NotAuthorizedError)
        is_expected.to permit(:update)
        expect(editing_idea_disabled_reason).to be_nil
        is_expected.to permit(:destroy)
        is_expected.not_to permit(:index_xlsx)

        expect(scope.resolve.size).to eq 1
      end
    end
  end

  context 'on a proposal that is in pre-screening' do
    let(:project) { create(:single_phase_proposals_project, phase_attrs: { prescreening_enabled: true }) }
    let(:idea) { create(:proposal, project: project, publication_status: 'submitted', idea_status: create(:proposals_status, code: 'prescreening')) }
    let!(:cosponsorship) { create(:cosponsorship, idea:, status: 'pending') }

    before do
      settings = AppConfiguration.instance.settings
      settings['input_cosponsorship'] = { 'allowed' => true, 'enabled' => true }
      AppConfiguration.instance.update!(settings: settings)
    end

    context "for a normal user that's not the author" do
      let(:user) { create(:user) }

      it do
        is_expected.not_to permit(:show)
        expect(scope.resolve.size).to eq 0
      end
    end

    context 'for a normal user invited as a cosponsor' do
      let(:user) { cosponsorship.user }

      it do
        is_expected.to permit(:show)
        expect(scope.resolve.size).to eq 1
      end
    end
  end
end
