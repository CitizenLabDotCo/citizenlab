# frozen_string_literal: true

require 'rails_helper'

describe Permissions::PermissionsService do
  let(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature! 'user_confirmation'
  end

  describe 'denied_reason_for_resource' do
    let(:action) { 'posting_initiative' }
    let(:permission) { Permission.find_by(permission_scope: nil, action: action) }
    let(:user) { create(:user) }

    before { Permissions::PermissionsUpdateService.new.update_global_permissions }

    it 'returns nil when action is allowed' do
      groups = create_list(:group, 2)
      groups.first.add_member(user).save!
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      expect(service.denied_reason_for_user(user, action)).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_user(nil, action)).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when user is not in authorized groups' do
      permission.update!(permitted_by: 'groups', group_ids: create_list(:group, 2).map(&:id))
      expect(service.denied_reason_for_user(user, action)).to eq 'not_in_group'
    end
  end

  describe 'denied_reason_for_permission' do
    before do
      create(:custom_field_birthyear, required: true)
      create(:custom_field_gender, required: false)
      create(:custom_field_checkbox, resource_type: 'User', required: true, key: 'extra_required_field')
      create(:custom_field_number, resource_type: 'User', required: false, key: 'extra_optional_field')
    end

    let(:user) do
      create(
        :user,
        first_name: 'Jerry',
        last_name: 'Jones',
        email: 'jerry@jones.com',
        custom_field_values: {
          'gender' => 'male',
          'birthyear' => 1982,
          'extra_required_field' => false,
          'extra_optional_field' => 29
        },
        registration_completed_at: Time.now,
        password: 'supersecret',
        email_confirmed_at: Time.now
      )
    end

    let(:permission) { create(:permission, permitted_by: permitted_by) }
    let(:denied_reason) { service.send(:user_denied_reason, permission, user) }

    context 'when permitted by everyone' do
      let(:permitted_by) { 'everyone' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to be_nil }
      end
    end

    context 'when permitted by light users' do
      let(:permitted_by) { 'everyone_confirmed_email' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light unconfirmed resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {})
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light unconfirmed inactive resident' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil)
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end

    context 'when permitted by full residents' do
      let(:permitted_by) { 'users' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed inactive resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when fully registered confirmed resident' do
        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered sso user' do
        before do
          facebook_identity = create(:facebook_identity)
          user.identities << facebook_identity
          user.update!(password_digest: nil)
          user.save!
        end

        it { expect(denied_reason).to be_nil }
      end

      context 'when fully registered confirmed inactive resident' do
        before { user.update!(registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end

    context 'when permitted by groups' do
      let(:groups) { create_list(:group, 2) }
      let(:permission) { create(:permission, permitted_by: 'groups', groups: groups) }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light unconfirmed resident who is group member' do
        before do
          user.reset_confirmation_and_counts
          user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}, manual_groups: [groups.last])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when light confirmed resident who is not a group member' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'not_in_group' }
      end

      context 'when fully registered resident who is not a group member' do
        it { expect(denied_reason).to eq 'not_in_group' }
      end

      context 'when admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end

      context 'when permitted by is changed from groups to users' do
        before { permission.update!(permitted_by: 'users') }

        it { expect(denied_reason).to be_nil }
      end
    end

    context 'when permitted by moderators' do
      let(:permitted_by) { 'admins_moderators' }

      context 'when not signed in' do
        let(:user) { nil }

        it { expect(denied_reason).to eq 'not_signed_in' }
      end

      context 'when light confirmed resident' do
        before { user.update!(password_digest: nil, identity_ids: [], first_name: nil, custom_field_values: {}) }

        it { expect(denied_reason).to eq 'not_permitted' }
      end

      context 'when fully registered unconfirmed resident' do
        before { user.reset_confirmation_and_counts }

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when unconfirmed admin' do
        before do
          user.reset_confirmation_and_counts
          user.update!(roles: [{ type: 'admin' }])
        end

        it { expect(denied_reason).to eq 'missing_data' }
      end

      context 'when confirmed admin' do
        before { user.update!(roles: [{ type: 'admin' }]) }

        it { expect(denied_reason).to be_nil }
      end

      context 'when confirmed inactive admin' do
        before { user.update!(roles: [{ type: 'admin' }], registration_completed_at: nil) }

        it { expect(denied_reason).to eq 'not_active' }
      end
    end
  end

  describe '"posting_idea" denied_reason_for_project' do
    it 'returns `posting_disabled` when posting is disabled' do
      project = create(:project_with_current_phase, current_phase_attrs: { posting_enabled: false })
      expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to eq 'posting_disabled'
    end

    it "returns `nil` when we're in an ideation context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to be_nil
    end

    it "returns `nil` when we're in an native_survey context" do
      project = create(:project_with_current_phase, current_phase_attrs: {
        participation_method: 'native_survey',
        native_survey_title_multiloc: { 'en' => 'Survey', 'nl-BE' => 'Vragenlijst' },
        native_survey_button_multiloc: { 'en' => 'Take the survey', 'nl-BE' => 'De enquete invullen' }
      })
      expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to be_nil
    end

    it "returns `not_ideation` when we're not in an ideation or native_survey context" do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'information' })
      expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to eq 'not_ideation'
    end

    it "returns `not_ideation` when we're in a voting context" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 }
      )
      expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to eq 'not_ideation'
    end

    it 'returns `project_inactive` when the timeline is over' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to eq 'project_inactive'
    end

    it 'returns `posting_limited_max_reached` if the posting limit was reached' do
      user = create(:user)
      project = create(:single_phase_ideation_project, phase_attrs: { posting_enabled: true, posting_method: 'limited', posting_limited_max: 1 })
      create(:idea, project: project, author: user, phases: project.phases)

      expect(service.denied_reason_for_project(project, user, 'posting_idea')).to eq 'posting_limited_max_reached'
    end

    it 'returns `posting_limited_max_reached` if the author posted a survey anonymously and the limit was reached' do
      user = create(:user)
      project = create(:single_phase_native_survey_project, phase_attrs: {
        posting_enabled: true, posting_method: 'limited', posting_limited_max: 1, allow_anonymous_participation: true
      })
      create(:native_survey_response, project: project, author: user, anonymous: true, phases: project.phases, creation_phase: project.phases.first)

      expect(service.denied_reason_for_project(project, user, 'posting_idea')).to eq 'posting_limited_max_reached'
    end

    it 'returns nil if the posting limit was not reached' do
      user = create(:user)
      project = create(:single_phase_ideation_project, phase_attrs: { posting_enabled: true, posting_method: 'limited', posting_limited_max: 1 })
      create(:idea, project: project)

      expect(service.denied_reason_for_project(project, user, 'posting_idea')).to be_nil
    end

    context 'with phase permissions' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'posting_idea')
      end

      it 'returns nil when posting is allowed' do
        user = create(:user)
        group = create(:group)
        group.add_member(user).save!

        permission.update!(permitted_by: 'groups', groups: [group])
        expect(service.denied_reason_for_project(project, user, 'posting_idea')).to be_nil
      end

      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_project(project, nil, 'posting_idea')).to eq 'not_signed_in'
      end

      it 'returns `not_in_group` when posting is not permitted' do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.denied_reason_for_project(project, create(:user), 'posting_idea')).to eq 'not_in_group'
      end

      it 'returns nil when everyone can post and the user is not signed in' do
        permission.update! permitted_by: 'everyone'
        expect(service.denied_reason_for_project(project, nil, 'posting_idea')).to be_nil
      end
    end
  end

  describe '"commenting_idea" denied_reason_for_project' do
    let(:user) { create(:user) }

    it 'returns nil when the commenting is allowed in the current phase' do
      project = create(:project_with_current_phase)
      expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to be_nil
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to be_nil
    end

    it 'returns `commenting_disabled` when commenting is disabled in the current phase' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { commenting_enabled: false }
      )
      expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to eq 'commenting_disabled'
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to eq 'commenting_disabled'
    end

    it "returns 'project_inactive' when the timeline hasn't started" do
      project = create(:project_with_future_phases)
      expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to eq 'project_inactive'
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the timeline is over" do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to eq 'project_inactive'
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:project_with_current_phase, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to eq 'project_inactive'
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to eq 'project_inactive'
    end

    it "returns nil when we're in a participatory budgeting context" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 }
      )
      expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to be_nil
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to be_nil
    end

    it "returns 'idea_not_in_current_phase' for an idea when it's not in the current phase" do
      project = create(:project_with_current_phase)
      idea = create(:idea, project: project, phases: [project.phases[1]])
      expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to eq 'idea_not_in_current_phase'
    end

    context 'with phase permissions' do
      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'commenting_idea')
      end

      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_project(project, nil, 'commenting_idea')).to eq 'not_signed_in'

        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.denied_reason_for_idea(idea, nil, 'commenting_idea')).to eq 'not_signed_in'
      end

      it 'returns `not_in_group` commenting is not permitted for the user' do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to eq 'not_in_group'

        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to eq 'not_in_group'
      end

      it "returns 'commenting_disabled' when commenting is disabled in the phase" do
        project.phases[2].update!(commenting_enabled: false)
        expect(service.denied_reason_for_project(project, user, 'commenting_idea')).to eq 'commenting_disabled'
        idea = create(:idea, project: project, phases: [project.phases[2]])
        expect(service.denied_reason_for_idea(idea, user, 'commenting_idea')).to eq 'commenting_disabled'
      end
    end
  end

  describe '"reacting_idea" denied_reason_for...' do
    let(:user) { create(:user) }

    context 'a reaction' do
      # TODO: JS - No tests for up/down mode
      it 'returns nil when reacting is enabled in the current phase' do
        project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: true })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to be_nil
      end

      it "returns `project_inactive` when the timeline hasn't started yet" do
        project = create(:project_with_future_phases)
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to eq 'project_inactive'
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx' },
          current_phase_attrs: { reacting_enabled: true }
        )
        idea_phases = project.phases.order(:start_at).take(2) + [project.phases.order(:start_at).last]
        idea = create(:idea, project: project, phases: idea_phases)
        reaction = build(:reaction, user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to eq 'idea_not_in_current_phase'
      end

      it 'returns `reacting_disabled` if reacting is disabled' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to eq 'reacting_disabled'
      end

      it 'returns `reacting_dislike_disabled` for a dislike if disliking is disabled' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to eq 'reacting_dislike_disabled'
      end

      it 'returns nil for a like if disliking is disabled' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, mode: 'up', user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to be_nil
      end

      it "returns nil for a dislike, but while the mode is explicitly specified as 'up', even though disliking is disabled" do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_dislike_enabled: false })
        idea = create(:idea, project: project, phases: project.phases)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user, reaction_mode: 'up')).to be_nil
      end

      it 'returns `reacting_like_limited_max_reached` if the like limit was reached' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1 })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'up', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'up', user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to eq 'reacting_like_limited_max_reached'
      end

      it 'returns nil if the like limit was not reached' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1 })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'down', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'up', user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to be_nil
      end

      it 'returns `reacting_dislike_limited_max_reached` if the disliking limit was reached' do
        project = create(:single_phase_ideation_project, phase_attrs: {
          reacting_enabled: true, reacting_dislike_enabled: true,
          reacting_dislike_method: 'limited', reacting_dislike_limited_max: 1
        })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'down', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to eq 'reacting_dislike_limited_max_reached'
      end

      it 'returns nil if the disliking limit was not reached' do
        project = create(:single_phase_ideation_project, phase_attrs: {
          reacting_enabled: true, reacting_dislike_enabled: true,
          reacting_dislike_method: 'limited', reacting_dislike_limited_max: 1
        })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'up', user: user, reactable: idea)
        reaction = build(:reaction, mode: 'down', user: user, reactable: idea)

        expect(service.denied_reason_for_idea_reaction(reaction, user)).to be_nil
      end
    end

    context 'an idea' do
      context 'with up/down mode' do
      it 'returns nil when reacting is enabled' do
        project = create(:single_phase_ideation_project, phase_attrs: { reacting_enabled: true })
        idea = create(:idea, project: project, phases: project.phases)

        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'down')).to be_nil
      end

      it 'returns `project_inactive` when the timeline has past' do
        project = create(:project_with_past_phases)
        idea = create(:idea, project: project, phases: project.phases)

        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'up')).to eq 'project_inactive'
        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'down')).to eq 'project_inactive'
      end

      it "returns `not_ideation` when we're in a voting (budgeting) phase" do
        project = create(:single_phase_budgeting_project)
        idea = create(:idea, project: project)

        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'up')).to eq 'not_ideation'
        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'down')).to eq 'not_ideation'
      end

      it "returns `idea_not_in_current_phase` when it's not in the current phase" do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx' },
          current_phase_attrs: { reacting_enabled: true }
        )
        idea_phases = [project.phases.order(:start_at).first, project.phases.order(:start_at).last]
        idea = create(:idea, project: project, phases: idea_phases)

        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'up')).to eq 'idea_not_in_current_phase'
        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'down')).to eq 'idea_not_in_current_phase'
      end

      it 'returns `reacting_dislike_limited_max_reached` if the dislike limit was reached' do
        project = create(:single_phase_ideation_project, phase_attrs: {
          reacting_enabled: true, reacting_dislike_enabled: true,
          reacting_dislike_method: 'limited', reacting_dislike_limited_max: 1
        })
        idea = create(:idea, project: project, phases: project.phases)
        create(:reaction, mode: 'down', user: user, reactable: idea)

        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'down')).to eq 'reacting_dislike_limited_max_reached'
      end
      end

      context 'without up/down' do
        let(:user) { create(:user) }

        it 'returns nil when reacting is enabled in the current phase' do
          project = create(:project_with_current_phase)
          idea = create(:idea, project: project, phases: [project.phases[2]])
          expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to be_nil
        end

        it "returns `idea_not_in_current_phase` when it's not in the current phase" do
          project = create(:project_with_current_phase)
          idea = create(:idea, project: project, phases: [project.phases[1]])
          expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to eq 'idea_not_in_current_phase'
        end

        it "returns 'reacting_disabled' if it's in the current phase and reacting is disabled" do
          project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: false })
          idea = create(:idea, project: project, phases: [project.phases[2]])
          expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to eq 'reacting_disabled'
        end

        it "returns 'project_inactive' when the timeline has past" do
          project = create(:project_with_past_phases)
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to eq 'project_inactive'
        end

        it "returns `not_ideation` when we're in a participatory budgeting context" do
          project = create(
            :project_with_current_phase,
            current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1200 }
          )
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to eq 'not_ideation'
        end

        it "returns 'project_inactive' when the project is archived" do
          project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
          idea = create(:idea, project: project, phases: project.phases)
          expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to eq 'project_inactive'
        end

        describe 'with phase permissions' do
          let(:project) do
            create(:project_with_current_phase, current_phase_attrs: { with_permissions: true, permissions_config: { reacting_idea: false } })
          end
          let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }

          it "returns `not_signed_in` if it's in the current phase and user needs to be signed in" do
            TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'reacting_idea')
                           .update!(permitted_by: 'users')
            expect(service.denied_reason_for_idea(idea, nil, 'reacting_idea')).to eq 'not_signed_in'
          end

          it "returns 'not_permitted' if it's in the current phase and reacting is not permitted" do
            expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to eq 'not_permitted'
          end

          it "returns 'not_in_group' if reacting is not permitted" do
            project = create(:single_phase_ideation_project, phase_attrs: { with_permissions: true })
            idea = create(:idea, project: project, phases: project.phases)
            permission = project.phases.first.permissions.find_by(action: 'reacting_idea')
            permission.update!(
              permitted_by: 'groups',
              group_ids: create_list(:group, 2).map(&:id)
            )
            expect(service.denied_reason_for_idea(idea, idea.author, 'reacting_idea')).to eq 'not_in_group'
          end
        end
      end
    end

    context 'a project' do
      it 'returns nil when reacting is enabled in the current phase' do
        project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: true })

        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to be_nil
      end

      it 'returns `project_inactive` when the project is archived' do
        project = create(
          :project_with_current_phase,
          admin_publication_attributes: { publication_status: 'archived' }, current_phase_attrs: { reacting_enabled: true }
        )

        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to eq 'project_inactive'
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to eq 'project_inactive'
      end

      it "returns `project_inactive` when the timeline hasn't started yet" do
        project = create(:project_with_future_phases)

        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to eq 'project_inactive'
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to eq 'project_inactive'
      end

      it 'returns `project_inactive` when the timeline has past' do
        project = create(:project_with_past_phases)

        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to eq 'project_inactive'
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to eq 'project_inactive'
      end

      it "returns `not_ideation` when we're in a participatory budgeting context" do
        project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1000 })

        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to eq 'not_ideation'
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to eq 'not_ideation'
      end

      it 'returns `reacting_disabled` if reacting is disabled' do
        project = create(:project_with_current_phase, current_phase_attrs: { reacting_enabled: false })

        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to eq 'reacting_disabled'
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to eq 'reacting_disabled'
      end

      it 'returns `reacting_like_limited_max_reached` if the like limit was reached' do
        project = create(:project_with_current_phase,
          current_phase_attrs: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 1 })
        create(:reaction, mode: 'up', user: user, reactable: create(:idea, project: project, phases: project.phases))

        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to eq 'reacting_like_limited_max_reached'
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to be_nil
      end
    end

    context 'a phase' do
      it 'returns nil when reacting is enabled' do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xcx', c: { reacting_enabled: true }, x: { reacting_enabled: false } }
        )
        phase = project.phases.order(:start_at)[1]

        expect(service.denied_reason_for_phase(phase, user, 'reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_phase(phase, user, 'reacting_idea', reaction_mode: 'down')).to be_nil
      end

      it 'returns nil when reacting is enabled for that phase, but disabled for the current phase' do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx', c: { reacting_enabled: false }, x: { reacting_enabled: true } }
        )
        phase = project.phases.order(:start_at).first

        expect(service.denied_reason_for_phase(phase, user, 'reacting_idea', reaction_mode: 'up')).to be_nil
        expect(service.denied_reason_for_phase(phase, user, 'reacting_idea', reaction_mode: 'down')).to be_nil
      end

      it 'returns `reacting_like_limited_max_reached` if the like limit was reached for that phase' do
        project = create(
          :project_with_current_phase,
          phases_config: { sequence: 'xxcxx', c: { reacting_enabled: true },
                           x: { reacting_enabled: true, reacting_like_method: 'limited', reacting_like_limited_max: 2 } }
        )
        phase = project.phases.order(:start_at).first
        ideas = create_list(:idea, 2, project: project, phases: project.phases)
        ideas.each do |idea|
          create(:reaction, mode: 'up', reactable: idea, user: user)
        end

        expect(service.denied_reason_for_phase(phase, user, 'reacting_idea', reaction_mode: 'up')).to eq 'reacting_like_limited_max_reached'
        expect(service.denied_reason_for_phase(phase, user, 'reacting_idea', reaction_mode: 'down')).to be_nil
      end
    end

    describe 'with phase permissions' do
      let(:reasons) { Permissions::PermissionsService::REACTING_DENIED_REASONS }

      let(:project) { create(:project_with_current_phase, current_phase_attrs: { with_permissions: true }) }
      let(:idea) { create(:idea, project: project, phases: [project.phases[2]]) }
      let(:permission) do
        TimelineService.new.current_phase_not_archived(project).permissions
          .find_by(action: 'reacting_idea')
      end

      it 'returns `not_signed_in` when user needs to be signed in' do
        permission.update!(permitted_by: 'users')
        expect(service.denied_reason_for_project(project, nil, 'reacting_idea', reaction_mode: 'up')).to eq 'not_signed_in'
        expect(service.denied_reason_for_project(project, nil, 'reacting_idea', reaction_mode: 'down')).to eq 'not_signed_in'
        expect(service.denied_reason_for_idea(idea, nil, 'reacting_idea', reaction_mode: 'up')).to eq 'not_signed_in'
        expect(service.denied_reason_for_idea(idea, nil, 'reacting_idea', reaction_mode: 'down')).to eq 'not_signed_in'
      end

      it "returns 'not_in_group' if it's in the current phase and reacting is not permitted" do
        permission.update!(permitted_by: 'groups', groups: create_list(:group, 2))
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'up')).to eq 'not_in_group'
        expect(service.denied_reason_for_project(project, user, 'reacting_idea', reaction_mode: 'down')).to eq 'not_in_group'
        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'up')).to eq 'not_in_group'
        expect(service.denied_reason_for_idea(idea, user, 'reacting_idea', reaction_mode: 'down')).to eq 'not_in_group'
      end
    end
  end

  describe '"taking_survey" denied_reason_for_project' do
    it 'returns `not_survey` when the active context is not a survey' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.denied_reason_for_project(project, create(:user), 'taking_survey')).to eq 'not_survey'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project(project, create(:user), 'taking_survey')).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the project is archived' do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project(project, create(:user), 'taking_survey')).to eq 'project_inactive'
    end

    it 'returns nil when taking the survey is allowed' do
      project = create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.denied_reason_for_project(project, user, 'taking_survey')).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project(project, nil, 'taking_survey')).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when taking the survey is not permitted' do
      project = create(:single_phase_typeform_survey_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_survey')
      permission.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      expect(service.denied_reason_for_project(project, create(:user), 'taking_survey')).to eq 'not_in_group'
    end
  end

  describe '"annotating_document" denied_reason_for_project' do
    it 'returns `not_document_annotation` when the active context is not document_annotation' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'ideation' })
      expect(service.denied_reason_for_project(project, create(:user), 'annotating_document'))
        .to eq 'not_document_annotation'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project(project, create(:user), 'annotating_document')).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the project is archived' do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project(project, create(:user), 'annotating_document')).to eq 'project_inactive'
    end

    it 'returns nil when annotating the document is allowed' do
      project = create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      groups = create_list(:group, 2, projects: [project])
      permission.update!(permitted_by: 'groups', group_ids: groups.map(&:id))
      user = create(:user)
      group = groups.first
      group.add_member user
      group.save!
      expect(service.denied_reason_for_project(project, user, 'annotating_document')).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project(project, nil, 'annotating_document')).to eq 'not_signed_in'
    end

    it 'returns `not_permitted` when annotating the document is not permitted' do
      project = create(:single_phase_document_annotation_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'annotating_document')
      permission.update!(permitted_by: 'admins_moderators')
      expect(service.denied_reason_for_project(project, create(:user), 'annotating_document')).to eq 'not_permitted'
    end
  end

  describe '"taking_poll" denied_reason_for_project' do
    it 'returns `not_poll` when the active context is not a poll' do
      project = create(:project_with_current_phase, current_phase_attrs: { participation_method: 'information' })
      expect(service.denied_reason_for_project(project, create(:user), 'taking_poll')).to eq 'not_poll'
    end

    it 'returns `already_responded` when the user already responded to the poll before' do
      project = create(:single_phase_poll_project)
      poll_response = create(:poll_response, phase: project.phases.first)
      user = poll_response.user
      expect(service.denied_reason_for_project(project, user, 'taking_poll')).to eq 'already_responded'
    end

    it 'returns `project_inactive` when the timeline has past' do
      project = create(:project_with_past_phases)
      expect(service.denied_reason_for_project(project, create(:user), 'taking_poll')).to eq 'project_inactive'
    end

    it 'returns `project_inactive` when the project is archived' do
      project = create(:single_phase_ideation_project, admin_publication_attributes: { publication_status: 'archived' })
      expect(service.denied_reason_for_project(project, create(:user), 'taking_poll')).to eq 'project_inactive'
    end

    it 'returns nil when taking the poll is allowed' do
      project = create(:single_phase_poll_project, phase_attrs: { with_permissions: true })
      permission = Permission.find_by(action: 'taking_poll', permission_scope: project.phases.first)
      group = create(:group, projects: [project])
      permission.update!(permitted_by: 'groups', groups: [group])
      user = create(:user)
      group.add_member(user)
      group.save!
      expect(service.denied_reason_for_project(project, user, 'taking_poll')).to be_nil
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(:single_phase_poll_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project(project, nil, 'taking_poll')).to eq 'not_signed_in'
    end

    it 'return `not_permitted` when taking the poll is not permitted' do
      project = create(:single_phase_poll_project, phase_attrs: { with_permissions: true })
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'taking_poll')
      permission.update!(permitted_by: 'admins_moderators')
      expect(service.denied_reason_for_project(project, create(:user), 'taking_poll')).to eq 'not_permitted'
    end
  end

  describe '"voting" disabled_reasons' do
    it 'returns nil when the idea is in the current phase and budgeting is allowed' do
      project = create(:project_with_current_phase, phases_config: {
        sequence: 'xxcxx'
      }, current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 })
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_idea(idea, create(:user), 'voting')).to be_nil
    end

    it 'returns `idea_not_in_current_phase` when the idea is not in the current phase, budgeting is allowed in the current phase and was allowed in the last phase the idea was part of' do
      project = create(:project_with_current_phase, phases_config: {
        sequence: 'xxcxx'
      }, current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 })
      idea = create(:idea, project: project, phases: [project.phases[1]])
      expect(service.denied_reason_for_idea(idea, create(:user), 'voting')).to eq 'idea_not_in_current_phase'
    end

    it "returns 'idea_not_in_current_phase' when the idea is not in the current phase, budgeting is permitted but was not permitted in the last phase the idea was part of" do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      phase = project.phases[1]
      permission = phase.permissions.find_by(action: 'voting')
      permission&.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      idea = create(:idea, project: project, phases: [project.phases[0], project.phases[1]])
      expect(service.denied_reason_for_idea(idea, create(:user), 'voting')).to eq 'idea_not_in_current_phase'
    end

    it 'returns `not_signed_in` when user needs to be signed in' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      idea = create(:idea, project: project, phases: [project.phases[2]])
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      permission.update!(permitted_by: 'users')
      expect(service.denied_reason_for_project(project, nil, 'voting')).to eq 'not_signed_in'
      expect(service.denied_reason_for_idea(idea, nil, 'voting')).to eq 'not_signed_in'
    end

    it 'returns `not_in_group` when the idea is in the current phase and voting is not permitted' do
      project = create(
        :project_with_current_phase,
        current_phase_attrs: { with_permissions: true, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 10_000 }
      )
      idea = create(:idea, project: project, phases: [project.phases[2]])
      permission = TimelineService.new.current_phase_not_archived(project).permissions.find_by(action: 'voting')
      permission.update!(
        permitted_by: 'groups',
        group_ids: create_list(:group, 2).map(&:id)
      )
      expect(service.denied_reason_for_project(project, create(:user), 'voting')).to eq 'not_in_group'
      expect(service.denied_reason_for_idea(idea, create(:user), 'voting')).to eq 'not_in_group'
    end

    it "returns 'project_inactive' when the timeline is over" do
      project = create(:project_with_past_phases)
      idea = create(:idea, project: project, phases: [project.phases[2]])
      expect(service.denied_reason_for_project(project, create(:user), 'voting')).to eq 'project_inactive'
      expect(service.denied_reason_for_idea(idea, create(:user), 'voting')).to eq 'project_inactive'
    end

    it "returns 'project_inactive' when the project is archived" do
      project = create(:single_phase_budgeting_project, admin_publication_attributes: { publication_status: 'archived' })
      idea = create(:idea, project: project)
      expect(service.denied_reason_for_project(project, create(:user), 'voting')).to eq 'project_inactive'
      expect(service.denied_reason_for_idea(idea, create(:user), 'voting')).to eq 'project_inactive'
    end
  end

  describe '"posting_idea" future_enabled_phase' do
    it 'returns the first upcoming phase that has posting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxxxxy',
          x: { posting_enabled: false },
          y: { posting_enabled: true },
          c: { posting_enabled: false }
        }
      )
      expect(service.future_enabled_phase(project, create(:user), 'posting_idea')).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has posting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { posting_enabled: false }
        }
      )
      expect(service.future_enabled_phase(project, create(:user), 'posting_idea')).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_enabled_phase(project, create(:user), 'posting_idea')).to be_nil
    end
  end

  describe 'future_reacting_enabled_phase' do
    it 'returns the first upcoming phase that has reacting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxy',
          x: { reacting_enabled: true, reacting_dislike_enabled: false },
          c: { reacting_enabled: false },
          y: { reacting_enabled: true, reacting_dislike_enabled: true }
        }
      )
      expect(service.future_enabled_phase(project, create(:user), 'reacting_idea', reaction_mode: 'up')).to eq project.phases.order(:start_at)[2]
      expect(service.future_enabled_phase(project, create(:user), 'reacting_idea', reaction_mode: 'down')).to eq project.phases.order(:start_at)[4]
    end

    it 'returns nil if no next phase has reacting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyy',
          y: { reacting_enabled: false }
        }
      )
      expect(service.future_enabled_phase(project, create(:user), 'reacting_idea', reaction_mode: 'up')).to be_nil
      expect(service.future_enabled_phase(project, create(:user), 'reacting_idea', reaction_mode: 'down')).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_enabled_phase(project, create(:user), 'reacting_idea', reaction_mode: 'up')).to be_nil
      expect(service.future_enabled_phase(project, create(:user), 'reacting_idea', reaction_mode: 'down')).to be_nil
    end
  end

  describe '"commenting_idea" future_enabled_phase' do
    it 'returns the first upcoming phase that has commenting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcxxxxxy',
          x: { commenting_enabled: false },
          y: { commenting_enabled: true },
          c: { commenting_enabled: false }
        }
      )
      expect(service.future_enabled_phase(project, create(:user), 'commenting_idea')).to eq project.phases.order(:start_at)[7]
    end

    it 'returns nil if no next phase has commenting enabled' do
      project = create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xcyyy',
          y: { commenting_enabled: false }
        }
      )
      expect(service.future_enabled_phase(project, create(:user), 'commenting_idea')).to be_nil
    end

    it 'returns nil for a project without future phases' do
      project = create(:project_with_past_phases)
      expect(service.future_enabled_phase(project, create(:user), 'commenting_idea')).to be_nil
    end
  end
end
