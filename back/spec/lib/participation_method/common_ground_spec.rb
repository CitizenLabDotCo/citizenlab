# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ParticipationMethod::CommonGround do
  subject(:participation_method) { described_class.new(phase) }

  let(:phase) { create(:common_ground_phase) }

  it 'is a participation method' do
    expect(described_class).to be < ParticipationMethod::Base
    expect(ParticipationMethod::Base.all_methods).to include(described_class)
  end

  describe '#method_str' do
    it 'returns common_ground' do
      expect(described_class.method_str).to eq 'common_ground'
    end
  end

  describe '#default_fields' do
    it 'returns the correct default fields' do
      transient_form = create(:custom_form, participation_context: phase)
      fields = participation_method.default_fields(transient_form)
      expect(fields.size).to eq(3)

      fields_attrs = fields.map(&:attributes)

      expect(fields_attrs).to match [
        hash_including(
          'resource_id' => transient_form.id,
          'resource_type' => 'CustomForm',
          'key' => 'page1',
          'code' => 'title_page',
          'input_type' => 'page',
          'required' => false,
          'enabled' => true,
          'ordering' => 0
        ),

        hash_including(
          'resource_id' => transient_form.id,
          'resource_type' => 'CustomForm',
          'key' => 'title_multiloc',
          'code' => 'title_multiloc',
          'input_type' => 'text_multiloc',
          'required' => true,
          'enabled' => true,
          'ordering' => 1
        ),

        hash_including(
          'resource_id' => transient_form.id,
          'resource_type' => 'CustomForm',
          'key' => 'form_end',
          'code' => nil,
          'input_type' => 'page',
          'required' => false,
          'enabled' => true,
          'ordering' => 2
        )
      ]
    end
  end

  describe 'constraints' do
    it 'has no constraints' do
      expect(participation_method.constraints).to eq({})
    end
  end

  describe '#supported_email_campaigns' do
    it 'returns campaigns supported for common ground' do
      expect(participation_method.supported_email_campaigns).to match_array %w[idea_published mention_in_official_feedback official_feedback_on_idea_you_follow project_phase_started]
    end
  end

  describe '#participation_ideas_published' do
    let(:user1) { create(:user) }
    let!(:idea1) { create(:idea, phases: [phase], created_at: 20.days.ago, published_at: 20.days.ago, author: user1, creation_phase_id: phase.id) } # before phase start
    let!(:idea2) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: user1, creation_phase_id: phase.id) } # during phase
    let!(:idea3) { create(:idea, phases: [phase], created_at: 1.day.ago, published_at: 1.day.ago, author: user1, creation_phase_id: phase.id) } # after phase end

    let(:user2) { create(:user) }
    let!(:idea4) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: user2, creation_phase_id: phase.id) } # during phase
    let!(:idea5) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: nil, author: user2, publication_status: 'draft', creation_phase_id: phase.id) } # during phase, but not published

    let!(:idea6) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: nil, author_hash: 'some_author_hash', creation_phase_id: phase.id) } # during phase, no author (e.g. anonymous participation)
    let!(:idea7) { create(:idea, phases: [phase], created_at: 10.days.ago, published_at: 10.days.ago, author: nil, author_hash: nil, creation_phase_id: phase.id) } # during phase, no author nor author_hash (e.g. imported idea)

    before { phase.update!(start_at: 15.days.ago, end_at: 2.days.ago) }

    it 'returns the participation ideas published data for published ideas published during phase' do
      participation_ideas_published = participation_method.send(:participation_ideas_published)

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

      # first_participation = participation_ideas_published.first
      # expect(first_participation[:acted_at])
      #   .to be_within(1.second).of(Idea.find(first_participation[:item_id]).published_at)
    end

    it 'correctly handles phases with no end date' do
      phase.update!(end_at: nil)
      participation_ideas_published = participation_method.send(:participation_ideas_published)

      expect(participation_ideas_published.pluck(:item_id)).to match_array([
        idea2.id,
        idea3.id,
        idea4.id,
        idea6.id,
        idea7.id
      ])
    end

    it 'does not include ideas that are not published' do
      participation_ideas_published = participation_method.send(:participation_ideas_published)

      idea_ids = participation_ideas_published.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea5.id)
    end

    it 'does not include transitive ideas' do
      idea2.creation_phase_id = nil
      idea2.save!(validate: false) # skip validations to allow non-transitive idea
      participation_ideas_published = participation_method.send(:participation_ideas_published)

      idea_ids = participation_ideas_published.map { |p| p[:item_id] }
      expect(idea_ids).not_to include(idea2.id)
    end
  end

  its(:use_reactions_as_votes?) { is_expected.to be(true) }
  its(:transitive?) { is_expected.to be(false) }
  its(:supports_status?) { is_expected.to be(false) }
  its(:supports_inputs_without_author?) { is_expected.to be(false) }
  its(:supports_submission?) { is_expected.to be(true) }
  its(:allow_posting_again_after) { is_expected.to eq(0.seconds) }
  its(:follow_idea_on_idea_submission?) { is_expected.to be(false) }
  its(:supports_edits_after_publication?) { is_expected.to be(true) }
  its(:supports_permitted_by_everyone?) { is_expected.to be(false) }
  its(:supports_multiple_phase_reports?) { is_expected.to be(false) }
  its(:supports_input_term?) { is_expected.to be(false) }
  its(:supports_assignment?) { is_expected.to be(false) }
  its(:supports_toxicity_detection?) { is_expected.to be(true) }
  its(:return_disabled_actions?) { is_expected.to be(false) }
  its(:supports_public_visibility?) { is_expected.to be(true) }
  its(:add_autoreaction_to_inputs?) { is_expected.to be(false) }

  its(:form_logic_enabled?) { is_expected.to be(false) }
  its(:user_fields_in_form?) { is_expected.to be(false) }
  its(:supports_custom_field_categories?) { is_expected.to be(false) }
  its(:built_in_title_required?) { is_expected.to be(true) }

  its(:supports_exports?) { is_expected.to be(true) }
  its(:supports_private_attributes_in_export?) { is_expected.to be(true) }

  # We might reconsider this in the future.
  its(:supports_commenting?) { is_expected.to be(false) }

  its(:supports_reacting?) { is_expected.to be(true) }
  it { expect(participation_method.supports_reacting?('up')).to be(true) }
  it { expect(participation_method.supports_reacting?('down')).to be(true) }
  it { expect(participation_method.supports_reacting?('neutral')).to be(true) }
end
