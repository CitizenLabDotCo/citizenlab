# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::Ideation do
  subject(:participation_method) { described_class.new phase }

  let(:phase) { create(:phase) }

  describe '#method_str' do
    it 'returns ideation' do
      expect(described_class.method_str).to eq 'ideation'
    end
  end

  describe '#assign_defaults' do
    context 'when the proposed idea status is available' do
      let!(:ideation_proposed) { create(:idea_status_proposed) }
      let!(:proposals_proposed) { create(:proposals_status, code: 'proposed') }
      let!(:initial_status) { create(:idea_status) }

      it 'sets a default "proposed" idea_status if not set' do
        input = build(:idea, idea_status: nil)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq ideation_proposed
      end

      it 'does not change the idea_status if it is already set' do
        initial_status = create(:idea_status)
        input = build(:idea, idea_status: initial_status)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end

    context 'when the proposed idea status is not available' do
      it 'raises ActiveRecord::RecordNotFound when the idea_status is not set' do
        input = build(:idea, idea_status: nil)
        expect { participation_method.assign_defaults input }.to raise_error ActiveRecord::RecordNotFound
      end

      it 'does not change the idea_status if it is already set' do
        create(:idea_status_proposed)
        initial_status = create(:idea_status)
        input = build(:idea, idea_status: initial_status)
        participation_method.assign_defaults input
        expect(input.idea_status).to eq initial_status
      end
    end
  end

  describe '#assign_defaults_for_phase' do
    let(:phase) { build(:phase) }

    it 'sets the ideas_order to trending' do
      participation_method.assign_defaults_for_phase
      expect(phase.ideas_order).to eq 'trending'
    end

    describe 'when prescreening is activated' do
      before { SettingsService.new.activate_feature! 'prescreening' }

      it 'sets prescreening_enabled to false' do
        participation_method.assign_defaults_for_phase
        expect(phase.prescreening_enabled).to be false
      end
    end
  end

  describe '#generate_slug' do
    let(:input) { create(:idea) }

    it 'sets and persists the slug of the input' do
      input.update_column :slug, nil
      input.title_multiloc = { 'en' => 'Changed title' }

      expect(participation_method.generate_slug(input)).to eq 'changed-title'
    end
  end

  describe '#create_default_form!' do
    it 'creates a default form on the project level' do
      form = nil
      expect { form = participation_method.create_default_form! }
        .to change(CustomForm, :count).by(1)
        .and change(CustomField, :count).by_at_least(1)

      expect(form.participation_context).to eq phase.project
    end
  end

  describe '#default_fields' do
    it 'returns the default ideation fields' do
      expect(
        participation_method.default_fields(create(:custom_form, participation_context: phase)).filter_map(&:code)
      ).to eq %w[
        title_page
        title_multiloc
        body_page
        body_multiloc
        uploads_page
        idea_images_attributes
        idea_files_attributes
        details_page
        topic_ids
        location_description
        proposed_budget
      ]
    end
  end

  describe '#author_in_form?' do
    it 'returns false for a visitor when idea_author_change is activated' do
      SettingsService.new.activate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(nil)).to be false
    end

    it 'returns false for a resident when idea_author_change is activated' do
      SettingsService.new.activate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(create(:user))).to be false
    end

    it 'returns false for a moderator when idea_author_change is deactivated' do
      SettingsService.new.deactivate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(create(:admin))).to be false
    end

    it 'returns true for a moderator when idea_author_change is activated' do
      SettingsService.new.activate_feature! 'idea_author_change'
      expect(participation_method.author_in_form?(create(:admin))).to be true
    end
  end

  describe '#budget_in_form?' do
    let(:c) { { participation_method: 'voting', voting_method: 'budgeting' } }
    let(:project) do
      create(
        :project_with_current_phase,
        phases_config: {
          sequence: 'xc',
          x: { participation_method: 'ideation' },
          c: c
        }
      )
    end
    let(:phase) { project.phases.first }

    it 'returns false for a resident and a timeline project with a budgeting phase' do
      expect(participation_method.budget_in_form?(create(:user))).to be false
    end

    describe do
      let(:c) { { participation_method: 'ideation' } }

      it 'returns false for a moderator and a timeline project without a budgeting phase' do
        expect(participation_method.budget_in_form?(create(:admin))).to be false
      end
    end

    it 'returns true for a moderator and a timeline project with a budgeting phase' do
      expect(participation_method.budget_in_form?(create(:admin))).to be true
    end
  end

  describe 'constraints' do
    it 'has constraints on built in fields to lock certain values from being changed' do
      expect(participation_method.constraints).to eq({
        title_page: { locks: { attributes: %i[title_multiloc] } },
        title_multiloc: { locks: { attributes: %i[title_multiloc required], deletion: true } },
        body_multiloc: { locks: { attributes: %i[title_multiloc] } },
        idea_images_attributes: { locks: { attributes: %i[title_multiloc] } },
        idea_files_attributes: { locks: { attributes: %i[title_multiloc] } },
        topic_ids: { locks: { attributes: %i[title_multiloc] } },
        location_description: { locks: { attributes: %i[title_multiloc] } },
        proposed_budget: { locks: { attributes: %i[title_multiloc] } }
      })
    end
  end

  describe '#custom_form' do
    let(:project) { create(:project_with_active_ideation_phase) }
    let(:project_form) { create(:custom_form, participation_context: project) }
    let(:phase) { project.phases.first }

    it 'returns the custom form of the project' do
      expect(participation_method.custom_form.participation_context_id).to eq project.id
    end
  end

  describe '#supported_email_campaigns' do
    it 'returns campaigns supported for ideation' do
      expect(participation_method.supported_email_campaigns).to match_array %w[comment_deleted_by_admin comment_on_idea_you_follow comment_on_your_comment idea_published mention_in_official_feedback official_feedback_on_idea_you_follow project_phase_started status_change_on_idea_you_follow your_input_in_screening]
    end
  end

  describe '#supports_serializing?' do
    it 'returns false for all attributes' do
      %i[
        voting_method voting_max_total voting_min_total voting_max_votes_per_idea
        baskets_count votes_count native_survey_title_multiloc native_survey_button_multiloc
      ].each do |attribute|
        expect(participation_method.supports_serializing?(attribute)).to be false
      end
    end
  end

  describe '#validate_phase' do
    it 'does not add an error with transitive inputs' do
      create(:idea, phases: [phase], project: phase.project)
      expect(phase).to be_valid
    end

    it 'adds an error with non-transitive inputs' do
      phase.update!(participation_method: 'proposals', reacting_threshold: 50, expire_days_limit: 10)
      create(:proposal, creation_phase: phase, project: phase.project)
      phase.participation_method = 'ideation'
      expect(phase).not_to be_valid
      expect(phase.errors.details).to eq({ participation_method: [{ error: :non_complying_inputs }] })
    end
  end

  its(:additional_export_columns) { is_expected.to eq %w[manual_votes] }
  its(:allowed_ideas_orders) { is_expected.to eq %w[trending random popular -new new comments_count] }
  its(:return_disabled_actions?) { is_expected.to be false }
  its(:supports_assignment?) { is_expected.to be true }
  its(:built_in_title_required?) { is_expected.to be(true) }
  its(:supports_commenting?) { is_expected.to be true }
  its(:supports_edits_after_publication?) { is_expected.to be true }
  its(:supports_exports?) { is_expected.to be true }
  its(:supports_input_term?) { is_expected.to be true }
  its(:supports_inputs_without_author?) { is_expected.to be false }
  its(:allow_posting_again_after) { is_expected.to eq 0.seconds }
  its(:supports_permitted_by_everyone?) { is_expected.to be false }
  its(:supports_public_visibility?) { is_expected.to be true }
  its(:supports_status?) { is_expected.to be true }
  its(:supports_submission?) { is_expected.to be true }
  its(:supports_toxicity_detection?) { is_expected.to be true }
  its(:use_reactions_as_votes?) { is_expected.to be false }
  its(:transitive?) { is_expected.to be true }
  its(:supports_private_attributes_in_export?) { is_expected.to be true }
  its(:form_logic_enabled?) { is_expected.to be false }
  its(:follow_idea_on_idea_submission?) { is_expected.to be true }
  its(:supports_custom_field_categories?) { is_expected.to be false }
  its(:user_fields_in_form?) { is_expected.to be false }
  its(:supports_multiple_phase_reports?) { is_expected.to be false }
  its(:add_autoreaction_to_inputs?) { is_expected.to be(true) }
  its(:everyone_tracking_enabled?) { is_expected.to be false }

  its(:supports_reacting?) { is_expected.to be(true) }
  it { expect(participation_method.supports_reacting?('up')).to be(true) }
  it { expect(participation_method.supports_reacting?('down')).to be(true) }
  it { expect(participation_method.supports_reacting?('neutral')).to be(false) }

  describe 'proposed_budget_in_form?' do # private method
    it 'is expected to be true' do
      expect(participation_method.send(:proposed_budget_in_form?)).to be true
    end
  end

  describe '#participation_ideas_published' do
    let(:user1) { create(:user) }
    let!(:idea1) { create(:idea, phases: [phase], published_at: 20.days.ago, author: user1) } # before phase start
    let!(:idea2) { create(:idea, phases: [phase], published_at: 10.days.ago, author: user1) } # during phase
    let!(:idea3) { create(:idea, phases: [phase], published_at: 1.day.ago, author: user1) } # after phase end

    let(:user2) { create(:user) }
    let!(:idea4) { create(:idea, phases: [phase], published_at: 10.days.ago, author: user2) } # during phase
    let!(:idea5) { create(:idea, phases: [phase], published_at: 10.days.ago, author: user2, publication_status: 'draft') } # during phase, but not published

    let!(:idea6) { create(:idea, phases: [phase], published_at: 10.days.ago, author: nil, author_hash: 'some_author_hash') } # during phase, no author (e.g. anonymous participation)
    let!(:idea7) { create(:idea, phases: [phase], published_at: 10.days.ago, author: nil, author_hash: nil) } # during phase, no author nor author_hash (e.g. imported idea)
    before { phase.update!(start_at: 15.days.ago, end_at: 2.days.ago) }

    it 'returns the participation ideas published data for published ideas published during phase' do
      participation_ideas_published = participation_method.participation_ideas_published

      expect(participation_ideas_published).to match_array([
        {
          item_id: idea2.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: user1.id,
          user_custom_field_values: {}
        },
        {
          item_id: idea4.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: user2.id,
          user_custom_field_values: {}
        },
        {
          item_id: idea6.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: 'some_author_hash',
          user_custom_field_values: {}
        },
        {
          item_id: idea7.id,
          action: 'posting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Idea',
          participant_id: idea7.id,
          user_custom_field_values: {}
        }
      ])

      first_participation = participation_ideas_published.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Idea.find(first_participation[:item_id]).published_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participation_ideas_published = participation_method.participation_ideas_published

      expect(participation_ideas_published.pluck(:item_id)).to match_array([
        idea2.id,
        idea3.id,
        idea4.id,
        idea6.id,
        idea7.id
      ])
    end
  end

  describe '#participation_idea_comments' do
    let!(:idea) { create(:idea, phases: [phase]) }

    let(:user1) { create(:user) }
    let!(:comment1) { create(:comment, idea: idea, created_at: 20.days.ago, author: user1) } # before phase start
    let!(:comment2) { create(:comment, idea: idea, created_at: 10.days.ago, author: user1) } # during phase
    let!(:comment3) { create(:comment, idea: idea, created_at: 1.day.ago, author: user1) } # after phase end

    let(:user2) { create(:user) }
    let!(:comment4) { create(:comment, idea: idea, created_at: 10.days.ago, author: user2) } # during phase

    let!(:comment5) { create(:comment, idea: idea, created_at: 10.days.ago, author: nil, author_hash: 'some_author_hash') } # during phase, no author
    let!(:comment6) { create(:comment, idea: idea, created_at: 10.days.ago, author: nil, author_hash: nil) } # during phase, no author nor author_hash

    before { phase.update!(start_at: 15.days.ago, end_at: 2.days.ago) }

    it 'returns the participation idea comments data for comments posted during phase' do
      participation_idea_comments = participation_method.participation_idea_comments

      expect(participation_idea_comments).to match_array([
        {
          item_id: comment2.id,
          action: 'commenting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Comment',
          participant_id: user1.id,
          user_custom_field_values: {}
        },
        {
          item_id: comment4.id,
          action: 'commenting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Comment',
          participant_id: user2.id,
          user_custom_field_values: {}
        },
        {
          item_id: comment5.id,
          action: 'commenting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Comment',
          participant_id: 'some_author_hash',
          user_custom_field_values: {}
        },
        {
          item_id: comment6.id,
          action: 'commenting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Comment',
          participant_id: comment6.id,
          user_custom_field_values: {}
        }
      ])

      first_participation = participation_idea_comments.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Comment.find(first_participation[:item_id]).created_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participation_idea_comments = participation_method.participation_idea_comments

      expect(participation_idea_comments.pluck(:item_id)).to match_array([
        comment2.id,
        comment3.id,
        comment4.id,
        comment5.id,
        comment6.id
      ])
    end
  end

  describe '#participation_idea_reactions' do
    let!(:idea1) { create(:idea, phases: [phase]) }
    let!(:idea2) { create(:idea, phases: [phase]) }
    let!(:idea3) { create(:idea, phases: [phase]) }

    let(:user1) { create(:user) }
    let!(:reaction1) { create(:reaction, reactable: idea1, created_at: 20.days.ago, user: user1, mode: 'up') } # before phase start
    let!(:reaction2) { create(:reaction, reactable: idea2, created_at: 10.days.ago, user: user1, mode: 'up') } # during phase
    let!(:reaction3) { create(:reaction, reactable: idea3, created_at: 1.day.ago, user: user1, mode: 'up') } # after phase end

    let(:user2) { create(:user) }
    let!(:reaction4) { create(:reaction, reactable: idea2, created_at: 10.days.ago, user: user2, mode: 'down') } # during phase

    let!(:reaction5) { create(:reaction, reactable: idea1, created_at: 10.days.ago, user: nil, mode: 'up') } # during phase, no user

    before { phase.update!(start_at: 15.days.ago, end_at: 2.days.ago) }

    it 'returns the participation idea reactions data for reactions made during phase' do
      participation_idea_reactions = participation_method.participation_idea_reactions

      expect(participation_idea_reactions).to match_array([
        {
          item_id: reaction2.id,
          action: 'reacting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Reaction',
          participant_id: user1.id,
          user_custom_field_values: {}
        },
        {
          item_id: reaction4.id,
          action: 'reacting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Reaction',
          participant_id: user2.id,
          user_custom_field_values: {}
        },
        {
          item_id: reaction5.id,
          action: 'reacting_idea',
          acted_at: a_kind_of(Time),
          classname: 'Reaction',
          participant_id: reaction5.id,
          user_custom_field_values: {}
        }
      ])

      first_participation = participation_idea_reactions.first
      expect(first_participation[:acted_at])
        .to be_within(1.second).of(Reaction.find(first_participation[:item_id]).created_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participation_idea_reactions = participation_method.participation_idea_reactions

      expect(participation_idea_reactions.pluck(:item_id)).to match_array([
        reaction2.id,
        reaction3.id,
        reaction4.id,
        reaction5.id
      ])
    end
  end
end
