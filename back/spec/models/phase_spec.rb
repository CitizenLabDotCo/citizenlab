# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Phase do
  subject { create(:phase) }

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:phase)).to be_valid
    end
  end

  describe 'description sanitizer' do
    it 'sanitizes script tags in the description' do
      phase = create(:phase, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(phase.description_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end
  end

  describe 'voting_term_singular_multiloc_with_fallback' do
    it "falls back to the translations when there's no title_multiloc" do
      item = create(:phase, voting_term_singular_multiloc: nil)
      expect(item.voting_term_singular_multiloc_with_fallback).to match({ 'en' => 'vote', 'fr-FR' => 'vote', 'nl-NL' => 'stem' })
    end

    it 'returns the custom copy for locales with custom copy and falls back to the translations for other locales' do
      item = create(:phase, voting_term_singular_multiloc: { 'nl-NL' => 'voorkeur' })
      expect(item.voting_term_singular_multiloc_with_fallback).to match({ 'en' => 'vote', 'fr-FR' => 'vote', 'nl-NL' => 'voorkeur' })
    end
  end

  describe 'voting_term_plural_multiloc_with_fallback' do
    it "falls back to the translations when there's no title_multiloc" do
      item = create(:phase, voting_term_plural_multiloc: nil)
      expect(item.voting_term_plural_multiloc_with_fallback).to match({ 'en' => 'votes', 'fr-FR' => 'votes', 'nl-NL' => 'stemmen' })
    end

    it 'returns the custom copy for locales with custom copy and falls back to the translations for other locales' do
      item = create(:phase, voting_term_plural_multiloc: { 'en' => 'preferences' })
      expect(item.voting_term_plural_multiloc_with_fallback).to match({ 'en' => 'preferences', 'fr-FR' => 'votes', 'nl-NL' => 'stemmen' })
    end
  end

  describe 'timing validation' do
    it 'succeeds when start_at and end_at are equal' do
      phase = build(:phase)
      phase.end_at = phase.start_at
      expect(phase).to be_valid
    end

    it 'fails when end_at is before start_at' do
      phase = build(:phase)
      phase.end_at = phase.start_at - 1.day
      expect(phase).to be_invalid
    end
  end

  describe 'participation_method' do
    it 'cannot be null' do
      p = create(:phase, participation_method: 'ideation')
      p.participation_method = nil
      expect(p.save).to be false
    end

    it 'can be voting' do
      p = create(:phase, participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 200)
      expect(p.save).to be true
    end

    it 'can be changed from a transitive method to another one' do
      phase = create(:phase, participation_method: 'ideation')
      phase.participation_method = 'voting'
      phase.voting_method = 'budgeting'
      phase.ideas_order = 'random'
      phase.voting_max_total = 200
      expect(phase.save).to be true
    end

    it 'cannot be changed from a transitive method to a non-transitive one' do
      phase = create(:phase, participation_method: 'ideation')
      phase.participation_method = 'native_survey'
      phase.ideas_order = nil
      expect(phase.save).to be false
      expect(phase.errors.details).to eq({ participation_method: [{ error: :change_not_permitted }] })
    end

    it 'cannot be changed from a non-transitive method to a transitive one' do
      phase = create(:phase, participation_method: 'native_survey')
      phase.participation_method = 'voting'
      phase.voting_method = 'budgeting'
      phase.voting_max_total = 200
      expect(phase.save).to be false
      expect(phase.errors.details).to eq({ participation_method: [{ error: :change_not_permitted }] })
    end
  end

  describe 'presentation_mode' do
    it 'can be null for non-ideation phases' do
      p = create(:phase, participation_method: 'information')
      p.presentation_mode = nil
      expect(p.save).to be true
    end

    it 'cannot be null for an ideation phase' do
      p = create(:phase, participation_method: 'ideation')
      p.presentation_mode = nil
      expect(p.save).to be false
    end
  end

  describe 'campaigns_settings validation' do
    it 'fails when null' do
      phase = build(:phase, campaigns_settings: nil)
      expect(phase).to be_invalid
    end

    it 'fails when empty' do
      phase = build(:phase, campaigns_settings: {})
      expect(phase).to be_invalid
    end

    it 'fails when contains invalid key' do
      phase = build(:phase, campaigns_settings: { invalid_key: true })
      expect(phase).to be_invalid
    end

    it 'fails when contains invalid value' do
      phase = build(:phase, campaigns_settings: { project_phase_started: 'not_a_boolean' })
      expect(phase).to be_invalid
    end

    it 'succeeds when contains valid key and value' do
      phase = build(:phase, campaigns_settings: { project_phase_started: true })
      expect(phase).to be_valid
    end
  end

  describe 'project validation' do
    it 'succeeds when the associated project is a timeline project' do
      phase = build(:phase, project: build(:project, process_type: 'timeline'))
      expect(phase).to be_valid
    end

    it 'fails when the associated project is not a timeline project' do
      phase = build(:phase, project: build(:continuous_project))
      expect(phase).to be_invalid
    end

    it 'fails when the associated project has overlapping phases' do
      project = create(:project, process_type: 'timeline')
      create(:phase, project: project, start_at: (Time.now - 5.days), end_at: (Time.now + 5.days))
      phase_left_overlap = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now - 3.days))
      expect(phase_left_overlap).to be_invalid
      phase_left_overlap = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now - 5.days))
      expect(phase_left_overlap).to be_invalid # also not same day
      phase_right_overlap = build(:phase, project: project.reload, start_at: (Time.now + 5.days), end_at: (Time.now + 10.days))
      expect(phase_right_overlap).to be_invalid # also not same day
      phase_inside = build(:phase, project: project.reload, start_at: (Time.now - 3.days), end_at: (Time.now + 3.days))
      expect(phase_inside).to be_invalid
      phase_outside = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now + 10.days))
      expect(phase_outside).to be_invalid
      phase_equal = build(:phase, project: project.reload, start_at: (Time.now - 5.days), end_at: (Time.now + 5.days))
      expect(phase_equal).to be_invalid
      phase_left = build(:phase, project: project.reload, start_at: (Time.now - 10.days), end_at: (Time.now - 6.days))
      expect(phase_left).to be_valid
      phase_right = build(:phase, project: project.reload, start_at: (Time.now + 6.days), end_at: (Time.now + 10.days))
      expect(phase_right).to be_valid
    end
  end

  describe 'voting_max_total' do
    it 'can be updated in a project with just one phase' do
      project = create(
        :project_with_current_phase,
        phases_config: { sequence: 'xc' },
        current_phase_attrs: { participation_method: 'voting', voting_method: 'budgeting', voting_max_total: 1234 }
      )
      phase = project.phases.find_by voting_method: 'budgeting'

      phase.voting_max_total = 9876
      expect(phase).to be_valid
    end
  end

  describe '#ends_before?' do
    let(:start_date) { Time.zone.today }
    let(:phase) { create(:phase, start_at: start_date, end_at: start_date + 1.day) }

    it 'returns false if passing today\'s date' do
      expect(phase.ends_before?(start_date)).to be false
    end

    it 'returns true if passing tomorrow\'s date' do
      expect(phase.ends_before?(start_date + 2.days)).to be true
    end
  end

  # too lazy to split the tests at this stage
  describe '::published' do
    let(:start_date) { Time.zone.today }
    let!(:phases) { create_list(:phase, 6, start_at: start_date, end_at: start_date + 1.month) }

    context 'when there are 3 phases that belong to published publications' do
      before do
        phases.first(2).each do |phase|
          draft = create(:project, admin_publication_attributes: { publication_status: 'draft' })
          phase.project.admin_publication.update(parent: draft.admin_publication)
        end

        phases[2].project.admin_publication.update(publication_status: 'draft')
      end

      it 'returns only the phases that belong to published publications' do
        expect(described_class.published.length).to eq 3
      end
    end
  end

  describe '::starting_on' do
    let(:start_date) { Time.zone.today }
    let!(:phases) { create_list(:phase, 6, start_at: start_date, end_at: start_date + 1.month) }

    context 'when there are 3 phases that belong to published publications' do
      it 'returns only the phases that belong to published publications' do
        expect(described_class.starting_on(start_date).length).to eq phases.length
      end

      it 'returns no phases if the date is tomorrow' do
        expect(described_class.starting_on(start_date + 1.day).length).to eq 0
      end
    end
  end

  describe '#native_survey?' do
    it 'returns true when the participation method is native_survey' do
      phase = create(:native_survey_phase)
      expect(phase.native_survey?).to be true
    end

    it 'returns false otherwise' do
      phase = create(:poll_phase)
      expect(phase.native_survey?).to be false
    end
  end

  describe '#can_contain_input?' do
    expected_results = {
      'information' => false,
      'ideation' => true,
      'survey' => false,
      'voting' => true,
      'poll' => false,
      'volunteering' => false,
      'native_survey' => true,
      'document_annotation' => false
    }
    # Written this way so that additional participation methods will make this spec fail.
    ParticipationContext::PARTICIPATION_METHODS.each do |participation_method|
      expected_result = expected_results[participation_method]
      context "for #{participation_method}" do
        let(:phase) { build(:phase, participation_method: participation_method) }

        it "returns #{expected_result}" do
          expect(phase.can_contain_input?).to be expected_result
        end
      end
    end
  end
end
