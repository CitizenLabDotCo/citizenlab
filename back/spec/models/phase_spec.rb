# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Phase do
  subject { create(:phase) }

  describe 'Default factory' do
    it 'is valid' do
      expect(build(:phase)).to be_valid
    end
  end

  describe 'associations' do
    it { is_expected.to have_many(:jobs_trackers).class_name('Jobs::Tracker').dependent(:destroy) }
  end

  describe 'common_ground_phase factory' do
    it 'is valid' do
      expect(build(:common_ground_phase)).to be_valid
    end
  end

  describe 'idea_feed_phase factory' do
    it 'is valid' do
      expect(build(:idea_feed_phase)).to be_valid
    end
  end

  it { is_expected.to belong_to(:project) }
  it { is_expected.to validate_presence_of(:title_multiloc) }

  describe 'description sanitizer' do
    it 'sanitizes script tags in the description' do
      phase = create(:phase, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(phase.description_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end
  end

  describe 'timing model validation' do
    it 'fails when the duration is less than 1 day' do
      phase = build(:phase)
      phase.end_at = phase.start_at + 1.day - 1.second
      expect(phase).to be_invalid
    end

    it 'succeeds when the duration is exactly 1 day' do
      phase = build(:phase)
      phase.end_at = phase.start_at + 1.day
      expect(phase).to be_valid
    end

    it 'fails when end_at is before start_at' do
      phase = build(:phase)
      phase.end_at = phase.start_at - 1.day
      expect(phase).to be_invalid
    end
  end

  describe 'timing database validation' do
    let_it_be(:phase) { create(:phase) }

    it 'succeeds if `start_at` is before `end_at`' do
      expect { phase.update_columns(end_at: phase.start_at + 1.second) }.not_to raise_error
    end

    it 'fails if `start_at` is equal or after `end_at`' do
      expect { phase.update_columns(end_at: phase.start_at) }.to raise_error(ActiveRecord::StatementInvalid)
      expect { phase.update_columns(end_at: phase.start_at - 1.second) }.to raise_error(ActiveRecord::StatementInvalid)
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
  end

  describe '#validate_no_inputs_on_participation_method_change' do
    it 'blocks changing the participation method when the phase has transitive inputs (via ideas_phases)' do
      phase = create(:phase, participation_method: 'ideation')
      create(:idea, phases: [phase], project: phase.project)
      phase.participation_method = 'information'
      phase.ideas_order = nil
      expect(phase).not_to be_valid
      expect(phase.errors.details).to eq({ participation_method: [{ error: :has_inputs }] })
    end

    it 'blocks changing the participation method when the phase has non-transitive inputs (via creation_phase)' do
      phase = create(:proposals_phase)
      create(:proposal, creation_phase: phase, project: phase.project)
      phase.participation_method = 'ideation'
      expect(phase).not_to be_valid
      expect(phase.errors.details).to eq({ participation_method: [{ error: :has_inputs }] })
    end

    it 'allows changing the participation method when there are no inputs' do
      phase = create(:phase, participation_method: 'ideation')
      phase.participation_method = 'information'
      phase.ideas_order = nil
      expect(phase).to be_valid
    end
  end

  describe 'pmethod' do
    {
      'information' => ParticipationMethod::Information,
      'ideation' => ParticipationMethod::Ideation,
      'document_annotation' => ParticipationMethod::DocumentAnnotation,
      'survey' => ParticipationMethod::Survey,
      'voting' => ParticipationMethod::Voting,
      'poll' => ParticipationMethod::Poll,
      'volunteering' => ParticipationMethod::Volunteering,
      'native_survey' => ParticipationMethod::NativeSurvey,
      nil => ParticipationMethod::None
    }.each do |method_name, method_class|
      context "when the given participation_context's method is #{method_name}" do
        let(:phase) { build(:phase, participation_method: method_name) }

        it "returns an instance of #{method_class}" do
          expect(phase.pmethod).to be_an_instance_of(method_class)
        end
      end
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

  describe 'available_views' do
    describe 'defaults (set_presentation_mode callback)' do
      it 'defaults to [card] when not explicitly set' do
        phase = create(:phase, available_views: nil)
        expect(phase.available_views).to eq %w[card]
      end

      it 'automatically includes the presentation_mode in available_views' do
        phase = create(:phase, presentation_mode: 'map', available_views: %w[card])
        expect(phase.available_views).to include('map')
      end

      it 'does not duplicate if presentation_mode is already included' do
        phase = create(:phase, presentation_mode: 'card', available_views: %w[card map])
        expect(phase.available_views).to eq %w[card map]
      end
    end

    describe 'validation' do
      # Stub set_presentation_mode so the before_validation callback
      # doesn't auto-correct the values we're testing against.
      before { allow_any_instance_of(described_class).to receive(:set_presentation_mode) }

      it 'is invalid when empty' do
        phase = build(:phase, presentation_mode: 'card', available_views: [])
        expect(phase).not_to be_valid
        expect(phase.errors[:available_views].first).to include('non-empty array')
      end

      it 'is invalid with an unrecognized view mode' do
        phase = build(:phase, presentation_mode: 'card', available_views: %w[card unknown])
        expect(phase).not_to be_valid
        expect(phase.errors[:available_views].first).to include('invalid view modes')
      end

      it 'is invalid without card view' do
        phase = build(:phase, presentation_mode: 'map', available_views: %w[map])
        expect(phase).not_to be_valid
        expect(phase.errors[:available_views].first).to include('must include card view')
      end

      it 'is invalid when available_views does not include the presentation_mode' do
        phase = build(:phase, presentation_mode: 'map', available_views: %w[card feed])
        expect(phase).not_to be_valid
        expect(phase.errors[:available_views].first).to include('must include the default presentation mode')
      end

      it 'is valid with card and the current presentation_mode' do
        phase = build(:phase, presentation_mode: 'map', available_views: %w[card map])
        expect(phase).to be_valid
      end

      it 'is valid with all presentation modes' do
        phase = build(:phase, presentation_mode: 'card', available_views: %w[card map feed])
        expect(phase).to be_valid
      end
    end
  end

  describe 'input_term' do
    it 'default is set by the participation method defaults' do
      phase = build(:phase, input_term: nil)
      expect_any_instance_of(ParticipationMethod::Ideation).to receive(:assign_defaults_for_phase).and_call_original
      expect { phase.validate }.to change { phase.input_term }.from(nil).to('idea')
    end
  end

  describe '#validate_no_other_overlapping_phases' do
    let_it_be(:project) { create(:project) }
    let_it_be(:p) { create(:phase, project:, start_at: 5.days.ago, end_at: 5.days.from_now) }

    it 'rejects a phase overlapping on the left' do
      phase = build(:phase, project:, start_at: 10.days.ago, end_at: p.start_at + 1.second)
      expect(phase).to be_invalid
    end

    it 'rejects a phase overlapping on the right' do
      phase = build(:phase, project:, start_at: p.end_at - 1.second)
      expect(phase).to be_invalid
    end

    it 'rejects a phase contained inside' do
      phase = build(:phase, project:, start_at: p.start_at + 1.second, end_at: p.end_at - 1.second)
      expect(phase).to be_invalid
    end

    it 'rejects a phase that contains the existing one' do
      phase = build(:phase, project:, start_at: p.start_at - 1.second, end_at: p.end_at + 1.second)
      expect(phase).to be_invalid
    end

    it 'accepts a contiguous phase on the left' do
      phase = build(:phase, project:, start_at: 10.days.ago, end_at: p.start_at)
      expect(phase).to be_valid
    end

    it 'accepts a contiguous phase on the right' do
      phase = build(:phase, project:, start_at: p.end_at, end_at: 10.days.from_now)
      expect(phase).to be_valid
    end

    it 'fails when inserting a phase in-between two phases, where then new phase has no end date' do
      create(:phase, project:, start_at: 5.days.after(p.end_at), end_at: nil)

      phase = build(:phase, project:, start_at: 2.days.after(p.end_at), end_at: nil)
      expect(phase).not_to be_valid
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

  context 'for proposals phases' do
    let(:phase) { create(:proposals_phase) }

    describe 'expire_days_limit' do
      it 'can be set to a valid value' do
        phase.expire_days_limit = 1
        expect(phase).to be_valid
      end

      it 'is required' do
        phase.expire_days_limit = nil
        expect(phase).to be_invalid
      end

      it 'rejects values that are too small' do
        phase.expire_days_limit = 0
        expect(phase).to be_invalid
      end
    end

    describe 'reacting_threshold' do
      it 'can be set to a valid value' do
        phase.reacting_threshold = 2
        expect(phase).to be_valid
      end

      it 'is required' do
        phase.reacting_threshold = nil
        expect(phase).to be_invalid
      end

      it 'rejects values that are too small' do
        phase.reacting_threshold = 1
        expect(phase).to be_invalid
      end
    end
  end

  describe '#ends_before?' do
    let(:phase) { create(:phase) }

    it 'returns false if passing a time before phase.end_at' do
      expect(phase.ends_before?(phase.end_at - 1.second)).to be false
    end

    it 'returns true if passing a time after phase.end_at' do
      expect(phase.ends_before?(phase.end_at + 1.second)).to be true
    end

    it 'returns true if passing a time equal to phase.end_at' do
      expect(phase.ends_before?(phase.end_at)).to be true
    end

    it 'returns false if the phase has no end date' do
      phase.update!(end_at: nil)
      expect(phase.ends_before?(phase.start_at + 10.years)).to be false
    end
  end

  describe '.published' do
    let(:published_phase) { create(:phase) }

    before do
      # Phase in a draft project
      create(:phase, project: create(:project, :draft))

      # Phase in a published project, but in a draft folder
      create(:phase).tap do |phase|
        admin_publication_folder = create(:admin_publication, :folder, :draft)
        phase.project.admin_publication.update(parent: admin_publication_folder)
      end
    end

    it 'returns only the phases that belong to published publications' do
      expect(described_class.published).to contain_exactly(published_phase)
    end
  end

  describe '.current' do
    let(:timeline_service) { TimelineService.new }

    it 'includes phases that have started and not yet ended' do
      phase = create(:phase, start_at: 1.day.ago, end_at: 1.day.from_now)
      expect(described_class.current).to include(phase)
      expect(timeline_service.current_phase(phase.project)).to eq(phase)
    end

    it 'includes phases starting now' do
      freeze_time do
        phase = create(:phase, start_at: Time.current)
        expect(described_class.current).to include(phase)
        expect(timeline_service.current_phase(phase.project)).to eq(phase)
      end
    end

    it 'includes phases with no end date that have started' do
      phase = create(:phase, start_at: 1.day.ago, end_at: nil)
      expect(described_class.current).to include(phase)
      expect(timeline_service.current_phase(phase.project)).to eq(phase)
    end

    it 'excludes phases that have not started yet' do
      phase = create(:phase, start_at: 1.day.from_now)
      expect(described_class.current).not_to include(phase)
      expect(timeline_service.current_phase(phase.project)).to be_nil
    end

    it 'excludes phases that have ended' do
      phase = create(:phase, start_at: 10.days.ago, end_at: 1.day.ago)
      expect(described_class.current).not_to include(phase)
      expect(timeline_service.current_phase(phase.project)).to be_nil
    end

    it 'excludes phases whose end_at is now (exclusive end)' do
      freeze_time do
        phase = create(:phase, start_at: 1.day.ago, end_at: Time.current)
        expect(described_class.current).not_to include(phase)
        expect(timeline_service.current_phase(phase.project)).to be_nil
      end
    end
  end

  describe 'native_survey_title_multiloc and native_survey_button_multiloc' do
    %i[
      native_survey_phase
      community_monitor_survey_phase
    ].each do |factory|
      context factory do
        let(:phase) { build(factory) }

        it 'must contain a survey title' do
          phase.native_survey_title_multiloc = { en: 'Survey' }
          expect(phase).to be_valid

          phase.native_survey_title_multiloc = {}
          expect(phase).not_to be_valid

          phase.native_survey_title_multiloc = nil
          expect(phase).not_to be_valid
        end

        it 'must contain survey button text' do
          phase.native_survey_button_multiloc = { en: 'Take the survey' }
          expect(phase).to be_valid

          phase.native_survey_button_multiloc = {}
          expect(phase).not_to be_valid

          phase.native_survey_button_multiloc = nil
          expect(phase).not_to be_valid
        end
      end
    end

    it 'does not need a survey title if not a type of native survey' do
      phase = build(:phase, native_survey_title_multiloc: {})
      expect(phase).to be_valid
    end

    it 'does not need a survey button if not a type of native survey' do
      phase = build(:phase, native_survey_button_multiloc: {})
      expect(phase).to be_valid
    end
  end

  describe '#validate_end_at' do
    let(:project) { create(:project_with_phases) }

    it 'allows blank end date for the last phase' do
      last_phase = project.phases.last
      last_phase.end_at = nil
      expect(last_phase).to be_valid
    end

    it 'does not allow blank end date for any other phase' do
      first_phase = project.phases.first
      first_phase.end_at = nil
      expect(first_phase).not_to be_valid
    end

    it 'allows a single phase project with a blank end_at' do
      project = create(:project)
      phase = create(:phase, project: project, end_at: nil)
      expect(phase).to be_valid
      expect(project.reload.phases.count).to eq 1
    end

    it 'allows decreasing the start date of a phase with no end date' do
      phase = create(:phase, end_at: nil)
      phase.start_at -= 1.day
      expect(phase).to be_valid
    end
  end

  context 'when the project has an open-ended last phase' do
    let_it_be(:project) do
      create(:project).tap do |p|
        p.phases << create(:phase, start_at: 5.days.ago, end_at: 5.days.from_now)
        p.phases << create(:phase, start_at: 10.days.from_now, end_at: nil)
      end
    end

    let(:last_phase) { project.phases.last }

    context 'and an open-ended phase is added' do
      it 'after the last phase, it closes the previous phase' do
        new_phase_start = last_phase.start_at + 15.days
        new_phase = create(:phase, project:, start_at: new_phase_start, end_at: nil)

        expect(last_phase.reload.end_at).to eq(new_phase_start)
        expect(new_phase.previous_phase_end_at_updated?).to be true
      end

      it 'too early after the last phase, it is invalid' do
        new_phase_start = last_phase.start_at + 23.hours
        new_phase = build(:phase, project:, start_at: new_phase_start, end_at: nil)

        expect(new_phase).not_to be_valid
        expect(new_phase.errors[:previous_phase]).to include('must be at least 24.0 hours')
      end

      it 'before the last phase, it is invalid' do
        new_phase = build(:phase, project:, start_at: last_phase.start_at - 1.day, end_at: nil)

        expect(new_phase).not_to be_valid
        expect(new_phase.errors[:end_at]).to include('cannot be blank unless it is the last phase')
      end
    end

    context 'and a bounded phase is added' do
      it 'after the last phase, it closes the previous phase' do
        new_phase_start = last_phase.start_at + 15.days
        new_phase = create(:phase, project:, start_at: new_phase_start, end_at: new_phase_start + 1.day)

        expect(last_phase.reload.end_at).to eq(new_phase_start)
        expect(new_phase.previous_phase_end_at_updated?).to be true
      end
    end

    it 'allows increasing the start_at of the open-ended phase' do
      last_phase.start_at += 1.day
      expect(last_phase).to be_valid
    end
  end

  describe '#validate_community_monitor_phase' do
    let(:project) { create(:project) }
    let(:survey_phase) { create(:native_survey_phase, project: project, start_at: Date.current, end_at: nil) }

    context 'survey is not a community monitor survey' do
      it 'is valid when the phase is not a community monitor native survey' do
        expect(survey_phase).to be_valid
      end
    end

    context 'survey is a community monitor survey' do
      before do
        project.update! hidden: true, internal_role: 'community_monitor'
        survey_phase.update! participation_method: 'community_monitor_survey'
      end

      it 'is valid' do
        expect(survey_phase).to be_valid
      end

      it 'is not valid when the project has more than one phase' do
        project.phases << create(:phase, project: project, start_at: survey_phase.start_at - 10.days, end_at: survey_phase.start_at - 5.days)
        expect(survey_phase).not_to be_valid
      end

      it 'is not valid when the phase has an end date' do
        survey_phase.end_at = survey_phase.start_at + 2.days
        expect(survey_phase).not_to be_valid
      end

      it 'is not valid when the project is not hidden' do
        project.hidden = false
        # survey_phase.project.admin_publication.publication_status = 'published'
        expect(survey_phase).not_to be_valid
      end
    end
  end

  describe '#disliking_enabled' do
    it 'defaults to false when disable_disliking feature flag is enabled (default)' do
      phase = build(:phase)
      expect(phase.reacting_dislike_enabled).to be false
    end

    it 'defaults to true when disable_disliking feature flag is disabled' do
      AppConfiguration.instance.settings['disable_disliking'] = { 'allowed' => true, 'enabled' => false }
      AppConfiguration.instance.save!
      phase = create(:phase)
      expect(phase.reacting_dislike_enabled).to be true
    end
  end

  describe 'prescreening_mode' do
    using RSpec::Parameterized::TableSyntax

    describe 'validation' do
      def set_feature_flags(prescreening:, flag_inappropriate_content:)
        AppConfiguration.instance.settings.tap do |settings|
          settings['prescreening'] = { 'allowed' => true, 'enabled' => prescreening }
          settings['prescreening_ideation'] = { 'allowed' => true, 'enabled' => prescreening }
          settings['flag_inappropriate_content'] = { 'allowed' => true, 'enabled' => flag_inappropriate_content }
        end

        AppConfiguration.instance.save!
      end

      describe 'on create' do
        where(:factory, :prescreening_mode, :prescreening, :flag_inappropriate_content, :valid) do
          :phase | nil | false | false | true
          :phase | 'all' | false | false | false
          :phase | 'all' | true | false | true
          :phase | 'flagged_only' | true | false | false
          :phase | 'flagged_only' | true | true | true
          :phase | 'invalid' | true | true | false
          :proposals_phase | nil | false | false | true
          :proposals_phase | 'all' | false | false | false
          :proposals_phase | 'all' | true | false | true
          :proposals_phase | 'flagged_only' | true | false | false
          :proposals_phase | 'flagged_only' | true | true | true
          :proposals_phase | 'invalid' | true | true | false
        end

        with_them do
          before { set_feature_flags(prescreening:, flag_inappropriate_content:) }

          it { expect(build(factory, prescreening_mode: prescreening_mode).valid?).to eq valid }
        end
      end

      describe 'on update' do
        it 'remains valid when feature is disabled but prescreening_mode unchanged' do
          set_feature_flags(prescreening: true, flag_inappropriate_content: false)
          phase = create(:phase, prescreening_mode: 'all')
          set_feature_flags(prescreening: false, flag_inappropriate_content: false)

          expect(phase).to be_valid
          phase.title_multiloc = { 'en' => 'Updated title' }
          expect(phase).to be_valid
        end

        it 'becomes invalid when changing prescreening_mode to non-nil with feature disabled' do
          set_feature_flags(prescreening: true, flag_inappropriate_content: true)
          phase = create(:phase, prescreening_mode: 'flagged_only')
          set_feature_flags(prescreening: false, flag_inappropriate_content: false)

          expect(phase).to be_valid
          phase.prescreening_mode = 'all'
          expect(phase).not_to be_valid
        end
      end
    end

    describe 'helper methods' do
      where(:mode, :enabled, :flagged_only, :all) do
        nil | false | false | false
        'flagged_only' | true | true | false
        'all' | true | false | true
      end

      with_them do
        subject(:phase) { build(:phase, prescreening_mode: mode) }

        it { expect(phase.prescreening_enabled?).to eq enabled }
        it { expect(phase.prescreening_flagged_only?).to eq flagged_only }
        it { expect(phase.prescreening_all?).to eq all }
      end
    end
  end
end
