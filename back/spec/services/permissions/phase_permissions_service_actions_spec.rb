require 'rails_helper'

describe Permissions::PhasePermissionsService do
  let(:service) { described_class.new(phase, user) }
  let(:phase) { TimelineService.new.current_phase(project) }
  let(:project) { create(:project_with_current_phase, current_phase_attrs: current_phase_attrs) }
  let(:current_phase_attrs) { {} }
  let(:user) { create(:user) }

  describe 'posting_idea denied_reason_for_action' do
    context 'when posting is disabled' do
      let(:current_phase_attrs) { { submission_enabled: false } }

      it 'returns `posting_disabled`' do
        expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_disabled'
      end
    end

    context 'when we\'re in an ideation context' do
      let(:current_phase_attrs) { { participation_method: 'ideation' } }

      it 'returns `nil`' do
        expect(service.denied_reason_for_action('posting_idea')).to be_nil
      end
    end

    context 'when we\'re in an native_survey context' do
      let(:current_phase_attrs) do
        {
          participation_method: 'native_survey',
          native_survey_title_multiloc: { 'en' => 'Survey', 'nl-BE' => 'Vragenlijst' },
          native_survey_button_multiloc: { 'en' => 'Take the survey', 'nl-BE' => 'De enquete invullen' },
          with_permissions: true
        }
      end

      it 'returns `nil`' do
        expect(service.denied_reason_for_action('posting_idea')).to be_nil
      end
    end

    context 'when we\'re not in an ideation or native_survey context' do
      let(:current_phase_attrs) { { participation_method: 'information' } }

      it 'returns `posting_not_supported`' do
        expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_not_supported'
      end
    end

    context "when we're in a voting context" do
      let(:current_phase_attrs) { { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 } }

      it "returns `posting_not_supported` when we're in a voting context" do
        expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_not_supported'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' }) }

      it 'returns `project_inactive`' do
        expect(service.denied_reason_for_action('posting_idea')).to eq 'project_inactive'
      end
    end

    context 'when the posting limit was reached' do
      let(:project) { create(:single_phase_native_survey_project) }

      it 'returns `posting_limited_max_reached`' do
        create(:idea, project: project, author: user, phases: project.phases)

        expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_limited_max_reached'
      end
    end

    context 'when the author posted a survey anonymously and the limit was reached' do
      let(:project) do
        project = create(:single_phase_native_survey_project, phase_attrs: {
          submission_enabled: true
        })

        project.phases.first.permissions.find_by(action: 'posting_idea').update!(user_data_collection: 'anonymous')

        project
      end

      it 'returns `posting_limited_max_reached`' do
        create(:idea_status_proposed)
        create(:native_survey_response, project: project, author: user, anonymous: true, phases: project.phases, creation_phase: project.phases.first)

        expect(service.denied_reason_for_action('posting_idea')).to eq 'posting_limited_max_reached'
      end
    end

    context 'when the posting limit was not reached' do
      let(:project) { create(:single_phase_native_survey_project) }

      it 'returns nil' do
        create(:idea, project: project)

        expect(service.denied_reason_for_action('posting_idea')).to be_nil
      end
    end

    context 'with phase permissions' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'posting_idea')
      end

      it 'returns nil when posting is allowed' do
        group = create(:group)
        group.add_member(user).save!

        permission.update!(permitted_by: 'users', groups: [group])
        expect(service.denied_reason_for_action('posting_idea')).to be_nil
      end

      context 'when the user needs to be signed in' do
        let(:user) { nil }

        it 'returns `user_not_signed_in` when user needs to be signed in' do
          permission.update!(permitted_by: 'users')
          expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_signed_in'
        end

        it 'returns nil when everyone can post and the user is not signed in' do
          permission.update! permitted_by: 'everyone'
          expect(service.denied_reason_for_action('posting_idea')).to be_nil
        end
      end

      it 'returns `user_not_in_group` when the user is not a group member' do
        permission.update!(permitted_by: 'users', groups: create_list(:group, 2))
        expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_in_group'
      end
    end

    context 'permitted group requires verification' do
      let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_verified` when not permitted, while the user is not verified' do
        permission = project.phases.first.permissions.find_by(action: 'posting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_verified'
      end

      it 'returns `user_not_permitted` when only permitted to admins' do
        permission = project.phases.first.permissions.find_by(action: 'posting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'admins_moderators', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_permitted'
      end

      context 'for a verified user' do
        let(:user) { create(:user, verified: true, birthyear: 2008) }

        it 'returns nil' do
          permission = project.phases.first.permissions.find_by(action: 'posting_idea')
          verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
          expect(service.denied_reason_for_action('posting_idea')).to be_nil
        end

        it 'returns `user_not_in_group` when not permitted' do
          permission = project.phases.first.permissions.find_by(action: 'posting_idea')
          birthyear = create(:custom_field_birthyear)
          verified_members = create(
            :smart_group,
            rules: [
              { ruleType: 'verified', predicate: 'is_verified' },
              { value: 2002, ruleType: 'custom_field_number', predicate: 'is_smaller_than_or_equal', customFieldId: birthyear.id }
            ]
          )
          permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
          expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_in_group'
        end
      end

      context 'when the user is not signed in' do
        let(:user) { nil }

        it 'returns `user_not_signed_in` when not permitted and a permitted group requires verification' do
          permission = project.phases.first.permissions.find_by(action: 'posting_idea')
          verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
          expect(service.denied_reason_for_action('posting_idea')).to eq 'user_not_signed_in'
        end
      end
    end
  end

  describe 'commenting_idea denied_reason_for_action' do
    it 'returns nil when the commenting is allowed in the current phase' do
      expect(service.denied_reason_for_action('commenting_idea')).to be_nil
    end

    context 'when commenting is disabled in the current phase' do
      let(:current_phase_attrs) { { commenting_enabled: false } }

      it 'returns `commenting_disabled`' do
        expect(service.denied_reason_for_action('commenting_idea')).to eq 'commenting_disabled'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' }) }

      it "returns 'project_inactive'" do
        expect(service.denied_reason_for_action('commenting_idea')).to eq 'project_inactive'
      end
    end

    context "when we're in a participatory budgeting context" do
      let(:current_phase_attrs) { { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 } }

      it 'returns nil' do
        expect(service.denied_reason_for_action('commenting_idea')).to be_nil
      end
    end

    context 'with phase permissions' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      end

      context 'when the user needs to be signed in' do
        let(:user) { nil }

        it 'returns `user_not_signed_in` when user needs to be signed in' do
          permission.update!(permitted_by: 'users')
          expect(service.denied_reason_for_action('commenting_idea')).to eq 'user_not_signed_in'
        end
      end

      it 'returns `user_not_in_group` commenting is not permitted for the user' do
        permission.update!(permitted_by: 'users', groups: create_list(:group, 2))
        expect(service.denied_reason_for_action('commenting_idea')).to eq 'user_not_in_group'
      end

      it "returns 'commenting_disabled' when commenting is disabled in the phase" do
        project.phases[2].update!(commenting_enabled: false)
        expect(service.denied_reason_for_action('commenting_idea')).to eq 'commenting_disabled'
      end
    end

    context 'when not permitted and a permitted group requires verification' do
      let(:current_phase_attrs) { { with_permissions: true } }

      it 'returns `user_not_verified`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', group_ids: [create(:group).id, verified_members.id])
        expect(service.denied_reason_for_action('commenting_idea')).to eq 'user_not_verified'
      end
    end
  end

  describe 'reacting_idea denied_reason_for_action' do
    context 'when reacting is enabled in the current phase' do
      let(:current_phase_attrs) { { reacting_enabled: true, reacting_dislike_enabled: true } }

      it 'returns nil' do
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to be_nil
      end
    end

    context 'when the project is archived' do
      let(:project) do
        create(
          :project_with_current_phase,
          admin_publication_attributes: { publication_status: 'archived' },
          current_phase_attrs: { reacting_enabled: true }
        )
      end

      it 'returns `project_inactive`' do
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'project_inactive'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'project_inactive'
      end
    end

    context "when we're in a participatory budgeting context" do
      let(:current_phase_attrs) { { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1000 } }

      it 'returns `reacting_not_supported`' do
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'reacting_not_supported'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'reacting_not_supported'
      end
    end

    context 'when reacting is disabled' do
      let(:current_phase_attrs) { { reacting_enabled: false } }

      it 'returns `reacting_disabled`' do
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'reacting_disabled'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'reacting_disabled'
      end
    end

    context 'when the like limit was reached' do
      let(:current_phase_attrs) { { reacting_enabled: true, reacting_dislike_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1 } }

      it 'returns `reacting_like_limited_max_reached`' do
        create(:reaction, mode: 'up', user: user, reactable: create(:idea, project: project, phases: project.phases))

        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'reacting_like_limited_max_reached'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to be_nil
      end
    end

    context 'permitted group requires verification' do
      context 'when in the current phase and reacting is not permitted' do
        let(:current_phase_attrs) { { with_permissions: true, reacting_dislike_enabled: true } }

        it "returns 'user_not_verified'" do
          create(:idea, project: project, phases: [project.phases[2]])
          permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
          verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
          expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'user_not_verified'
          expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'user_not_verified'
        end
      end

      context 'for an unauthenticated visitor' do
        let(:user) { nil }
        let(:project) { create(:single_phase_ideation_project, phase_attrs: { with_permissions: true, reacting_dislike_enabled: true }) }

        it "returns 'user_not_signed_in' if reacting is not permitted" do
          create(:idea, project: project, phases: project.phases)
          permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
          group = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
          permission.update!(permitted_by: 'users', groups: [create(:group), group])
          expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'user_not_signed_in'
          expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'user_not_signed_in'
        end
      end
    end

    describe 'with phase permissions' do
      let(:reasons) { described_class::REACTING_DENIED_REASONS }

      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true, reacting_dislike_enabled: true }) }
      let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions
          .find_by(action: 'reacting_idea')
      end

      context 'when the user needs to be signed in' do
        let(:user) { nil }

        it 'returns `user_not_signed_in` when user needs to be signed in' do
          permission.update!(permitted_by: 'users')
          expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'user_not_signed_in'
          expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'user_not_signed_in'
        end
      end

      it "returns 'user_not_in_group' if it's in the current phase and reacting is not permitted" do
        permission.update!(permitted_by: 'users', groups: create_list(:group, 2))
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'up')).to eq 'user_not_in_group'
        expect(service.denied_reason_for_action('reacting_idea', reaction_mode: 'down')).to eq 'user_not_in_group'
      end
    end
  end

  describe 'taking_survey denied_reason_for_action' do
    context 'when the active context is not a survey' do
      let(:current_phase_attrs) { { participation_method: 'ideation' } }

      it 'returns `not_survey`' do
        expect(service.denied_reason_for_action('taking_survey')).to eq 'not_survey'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' }) }

      it 'returns `project_inactive`' do
        expect(service.denied_reason_for_action('taking_survey')).to eq 'project_inactive'
      end
    end

    context 'when taking the survey is allowed' do
      let(:project) { create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true }) }

      it 'returns nil' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
        groups = create_list(:group, 2, projects: [project])
        permission.update!(permitted_by: 'users', group_ids: groups.map(&:id))
        group = groups.first
        group.add_member user
        group.save!
        expect(service.denied_reason_for_action('taking_survey')).to be_nil
      end

      it 'returns `user_not_in_group` when the user is not member of a permitted group' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
        permission.update!(
          permitted_by: 'users',
          group_ids: create_list(:group, 2).map(&:id)
        )
        expect(service.denied_reason_for_action('taking_survey')).to eq 'user_not_in_group'
      end
    end

    context 'when the user is not signed in' do
      let(:user) { nil }
      let(:project) { create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_signed_in` when user needs to be signed in' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_action('taking_survey')).to eq 'user_not_signed_in'
      end
    end

    context 'when taking the survey is not permitted and a permitted group requires verification' do
      let(:project) { create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_verified`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('taking_survey')).to eq 'user_not_verified'
      end
    end
  end

  describe 'annotating_document denied_reason_for_action' do
    context 'when the active context is not document_annotation' do
      let(:current_phase_attrs) { { participation_method: 'ideation' } }

      it 'returns `not_document_annotation`' do
        expect(service.denied_reason_for_action('annotating_document')).to eq 'not_document_annotation'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' }) }

      it 'returns `project_inactive`' do
        expect(service.denied_reason_for_action('annotating_document')).to eq 'project_inactive'
      end
    end

    context 'when annotating the document is allowed' do
      let(:project) { create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true }) }

      it 'returns nil' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
        groups = create_list(:group, 2, projects: [project])
        permission.update!(permitted_by: 'users', group_ids: groups.map(&:id))
        group = groups.first
        group.add_member user
        group.save!
        expect(service.denied_reason_for_action('annotating_document')).to be_nil
      end
    end

    context 'when the user needs to be signed in' do
      let(:user) { nil }
      let(:project) { create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_signed_in`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_action('annotating_document')).to eq 'user_not_signed_in'
      end
    end

    context 'when annotating the document is not permitted' do
      let(:project) { create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_permitted`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
        permission.update!(permitted_by: 'admins_moderators')
        expect(service.denied_reason_for_action('annotating_document')).to eq 'user_not_permitted'
      end
    end

    context 'when annotating the document not permitted and permitted group requires verification' do
      let(:project) { create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_verified`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('annotating_document')).to eq 'user_not_verified'
      end
    end
  end

  describe 'taking_poll denied_reason_for_action' do
    context 'when the active context is not a poll' do
      let(:current_phase_attrs) { { participation_method: 'information' } }

      it 'returns `not_poll`' do
        expect(service.denied_reason_for_action('taking_poll')).to eq 'not_poll'
      end
    end

    context 'when the user already responded to the poll before' do
      let(:project) { create(:single_phase_poll_project) }
      let(:user) { create(:poll_response, phase: project.phases.first).user }

      it 'returns `already_responded`' do
        expect(service.denied_reason_for_action('taking_poll')).to eq 'already_responded'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' }) }

      it 'returns `project_inactive`' do
        expect(service.denied_reason_for_action('taking_poll')).to eq 'project_inactive'
      end
    end

    context 'when taking the poll is allowed' do
      let(:project) { create(:single_phase_poll_project, phase_attrs: { with_permissions: true }) }

      it 'returns nil' do
        permission = Permission.find_by(action: 'taking_poll', permission_scope: project.phases.first)
        group = create(:group, projects: [project])
        permission.update!(permitted_by: 'users', groups: [group])
        group.add_member(user)
        group.save!
        expect(service.denied_reason_for_action('taking_poll')).to be_nil
      end
    end

    context 'when the user needs to be signed in' do
      let(:user) { nil }
      let(:project) { create(:single_phase_poll_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_signed_in`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_action('taking_poll')).to eq 'user_not_signed_in'
      end
    end

    context 'when taking the poll is not permitted' do
      let(:project) { create(:single_phase_poll_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_not_permitted` when taking the poll is not permitted' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
        permission.update!(permitted_by: 'admins_moderators')
        expect(service.denied_reason_for_action('taking_poll')).to eq 'user_not_permitted'
      end
    end

    context 'when taking the poll is not permitted and permitted group requires verification' do
      let(:project) { create(:single_phase_poll_project, phase_attrs: { with_permissions: true }) }

      it 'return `user_not_verified`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
        verified_members = create(:smart_group, rules: [{ ruleType: 'verified', predicate: 'is_verified' }])
        permission.update!(permitted_by: 'users', groups: [create(:group), verified_members])
        expect(service.denied_reason_for_action('taking_poll')).to eq 'user_not_verified'
      end
    end

    context 'when the user has not completed all registration fields' do
      let(:project) { create(:single_phase_poll_project, phase_attrs: { with_permissions: true }) }

      it 'returns `user_missing_requirements`' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
        permission.update!(permitted_by: 'users', global_custom_fields: true)
        gender_field = create(:custom_field_gender, required: true) # Created a required field that has not been filled in
        expect(service.denied_reason_for_action('taking_poll')).to eq 'user_missing_requirements'
        gender_field.update!(required: false) # Removed the required field
        service = described_class.new(phase, user)
        expect(service.denied_reason_for_action('taking_poll')).to be_nil
      end
    end
  end

  describe 'voting denied_reason_for_action' do
    context 'when the current phase is a voting phase' do
      let(:current_phase_attrs) { { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 } }

      context 'when the user needs to be signed in' do
        let(:user) { nil }

        it 'returns `user_not_signed_in` when user needs to be signed in' do
          permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
          permission.update!(permitted_by: 'users')
          expect(service.denied_reason_for_action('voting')).to eq 'user_not_signed_in'
        end
      end

      it 'returns `user_not_in_group` when the idea is in the current phase and voting is not permitted' do
        permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
        permission.update!(permitted_by: 'users', group_ids: create_list(:group, 2).map(&:id))
        expect(service.denied_reason_for_action('voting')).to eq 'user_not_in_group'
      end
    end

    context 'when the project is archived' do
      let(:project) { create(:single_phase_budgeting_project, admin_publication_attributes: { publication_status: 'archived' }) }

      it "returns 'project_inactive'" do
        expect(service.denied_reason_for_action('voting')).to eq 'project_inactive'
      end
    end
  end

  describe 'action_descriptors' do
    it 'does not run more than 4 queries for 5 ideation projects with default user permissions' do
      user = create(:user)
      5.times do
        phase = TimelineService.new.current_phase(create(:project_with_current_phase))
        create(:permission, action: 'posting_idea', permission_scope: phase, permitted_by: 'users')
        create(:permission, action: 'commenting_idea', permission_scope: phase, permitted_by: 'users')
        create(:permission, action: 'reacting_idea', permission_scope: phase, permitted_by: 'users')
        create(:permission, action: 'attending_event', permission_scope: phase, permitted_by: 'users')
      end

      # Load project with pre-loading as loaded by the controller
      projects = Project.preload(
        :project_images,
        :areas,
        :input_topics,
        :content_builder_layouts,
        phases: [:report, { permissions: [:groups] }], # :permissions
        admin_publication: [:children]
      )

      # First check project length sure all the 'projects' queries are preloaded
      expect(projects.length).to eq 5
      user_requirements_service = Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      expect do
        projects.each do |project|
          current_phase = TimelineService.new.current_phase(project)
          current_phase.project = project
          described_class.new(current_phase, user, user_requirements_service: user_requirements_service).action_descriptors
        end
      end.not_to exceed_query_limit(4) # Down from an original 470
    end

    it 'does not run more than 7 queries for 5 ideation projects with group based user permissions' do
      user = create(:user)
      group = create(:group)
      create(:membership, group: group, user: user)
      5.times do
        project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
        current_phase = TimelineService.new.current_phase(project)
        current_phase.permissions.each do |permission|
          permission.update!(permitted_by: 'users', groups: [group])
        end
      end

      # Load project with pre-loading as loaded by the controller
      projects = Project.preload(
        :project_images,
        :areas,
        :input_topics,
        :content_builder_layouts,
        phases: [:report, { permissions: [:groups] }], # :permissions
        admin_publication: [:children]
      )

      # First check project length sure all the 'projects' queries are preloaded
      expect(projects.length).to eq 5
      user_requirements_service = Permissions::UserRequirementsService.new(check_groups_and_verification: false)
      expect do
        projects.each do |project|
          current_phase = TimelineService.new.current_phase(project)
          current_phase.project = project
          described_class.new(current_phase, user, user_requirements_service: user_requirements_service).action_descriptors
        end
      end.not_to exceed_query_limit(7) # Down from an original 490
    end
  end
end
