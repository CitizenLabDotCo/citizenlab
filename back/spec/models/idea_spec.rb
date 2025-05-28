# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idea do
  context 'associations' do
    it { is_expected.to have_many(:reactions) }
  end

  describe 'title validation' do
    it 'requires title_multiloc when supports_built_in_fields? is true' do
      # Create an idea that will pass the supports_built_in_fields? condition
      idea = build(:idea, publication_status: 'published')

      allow(idea).to receive(:supports_built_in_fields?).and_return(true)

      idea.title_multiloc = nil

      expect(idea).to be_invalid
      expect(idea.errors[:title_multiloc]).to include("can't be blank")
    end

    it 'does not require title_multiloc when supports_built_in_fields? is false' do
      idea = build(:idea)
      allow(idea).to receive(:supports_built_in_fields?).and_return(false)

      idea.title_multiloc = nil

      expect(idea).to be_valid
    end
  end

  describe 'body validation' do
    it 'requires title_multiloc when supports_built_in_fields? is true' do
      # Create an idea that will pass the supports_built_in_fields? condition
      idea = build(:idea, publication_status: 'published')

      allow(idea).to receive(:supports_built_in_fields?).and_return(true)

      idea.body_multiloc = nil

      expect(idea).to be_invalid
      expect(idea.errors[:body_multiloc]).to include("can't be blank")
    end

    it 'does not require body_multiloc when supports_built_in_fields? is false' do
      idea = build(:idea)
      allow(idea).to receive(:supports_built_in_fields?).and_return(false)

      idea.body_multiloc = nil

      expect(idea).to be_valid
    end
  end

  it 'validates presence of slug' do
    idea = build(:idea)
    allow(idea).to receive(:generate_slug) # Stub to do nothing
    idea.slug = nil
    expect(idea).to be_invalid
    expect(idea.errors[:slug]).to include("can't be blank")
  end

  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea)).to be_valid
    end

    it 'can create an idea without author' do
      expect(build(:idea, author: nil).valid?(:create)).to be true
    end

    context 'without custom form' do
      it 'can publish an idea without custom fields' do
        project = create(:project)
        project.custom_form&.destroy!
        idea = build(:idea, project: project, custom_field_values: {})
        expect(idea.save(context: :publication)).to be true
      end
    end
  end

  describe '#participation_method_on_creation' do
    context 'in a timeline project when a creation phase is present' do
      let(:project) { create(:project_with_future_native_survey_phase) }
      let(:creation_phase) { project.phases.first }
      let(:idea) { build(:idea, project: project, creation_phase: creation_phase) }

      it 'returns ParticipationMethod::NativeSurvey' do
        expect(idea.participation_method_on_creation).to be_an_instance_of ParticipationMethod::NativeSurvey
      end
    end

    context 'in a timeline project when creation phase is NOT present' do
      let(:project) { create(:project_with_future_native_survey_phase) }
      let(:phase) { project.phases.first }
      let(:idea) { build(:idea, project: project) }

      it 'returns ParticipationMethod::Ideation' do
        expect(idea.participation_method_on_creation).to be_an_instance_of ParticipationMethod::Ideation
      end
    end
  end

  describe '#custom_form' do
    context 'in a timeline project when created in a phase and a form has been defined' do
      let(:project) { create(:project_with_future_native_survey_phase) }
      let(:phase) { project.phases.first }
      let!(:phase_form) { create(:custom_form, participation_context: phase) }
      let(:idea) { build(:idea, project: project, creation_phase: phase) }

      it 'returns the form of the phase in which the input was created' do
        expect(idea.custom_form).to eq phase_form
      end
    end

    context 'in a timeline project when created in a phase and a form has not been defined yet' do
      let(:project) { create(:project_with_future_native_survey_phase) }
      let(:phase) { project.phases.first }
      let(:idea) { build(:idea, project: project, creation_phase: phase) }

      it 'returns a new form' do
        form = idea.custom_form
        expect(form).to be_instance_of CustomForm
        expect(form).to be_new_record
        expect(form.participation_context_type).to eq 'Phase'
      end
    end

    context 'in a timeline project when created in an ideation phase and a form has been defined' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:phase) { project.phases.first }
      let!(:project_form) { create(:custom_form, participation_context: project) }
      let(:idea) { build(:idea, project: project) }

      it 'returns the form of the phase in which the input was created' do
        expect(idea.custom_form).to eq project_form
      end
    end

    context 'in a timeline project when created in an ideation phase and a form has not been defined yet' do
      let(:project) { create(:project_with_active_ideation_phase) }
      let(:phase) { project.phases.first }
      let(:idea) { build(:idea, project: project) }

      it 'returns a new form' do
        form = idea.custom_form
        expect(form).to be_instance_of CustomForm
        expect(form).to be_new_record
        expect(form.participation_context_type).to eq 'Project'
      end
    end

    context 'in a timeline project when created outside a phase' do
      let(:project) { create(:project_with_future_native_survey_phase) }
      let!(:project_form) { create(:custom_form, participation_context: project) }
      let(:phase) { project.phases.first }
      let!(:phase_form) { create(:custom_form, participation_context: phase) }
      let(:idea) { build(:idea, project: project) }

      it 'returns the form of the project' do
        expect(idea.custom_form).to eq project_form
      end
    end
  end

  describe '#input_term' do
    context 'when the idea belongs to a timeline project' do
      context 'when the idea is created in a phase' do
        let(:project) { create(:project_with_future_native_survey_phase) }
        let(:phase) { project.phases.first }
        let(:idea) { build(:idea, project: project, creation_phase: phase) }

        it 'returns the input_term of the phase' do
          phase.update!(input_term: 'option')
          expect(idea.input_term).to eq 'option'
        end
      end

      context 'when there is an active ideation phase' do
        let(:project) { create(:project_with_active_ideation_phase) }
        let(:phase) { project.phases.first }
        let(:idea) { build(:idea, project: project) }

        it 'returns the input_term of the active ideation phase' do
          phase.update!(input_term: 'issue')
          expect(idea.input_term).to eq 'issue'
        end

        context 'when there is an active budgeting phase' do
          let(:project) { create(:project_with_active_budgeting_phase) }
          let(:phase) { project.phases.first }
          let(:idea) { build(:idea, project: project) }

          it 'returns the input_term of the active budgeting phase' do
            phase.update!(input_term: 'option')
            expect(idea.input_term).to eq 'option'
          end
        end
      end

      context 'when the current ideation phase has no end date' do
        let(:project) { create(:project_with_two_past_ideation_phases) }
        let(:phase) { project.phases.last }
        let(:idea) { build(:idea, project: project, phases: project.phases) }

        it 'returns the input_term of the open ended (current) ideation phase' do
          phase.update!(input_term: 'issue')
          expect(idea.input_term).to eq 'issue'
        end
      end

      context 'when a future ideation phase has no end date' do
        let(:project) { create(:project_with_past_ideation_and_future_ideation_phase) }
        let(:idea) { build(:idea, project: project, phases: project.phases) }

        it 'returns the input_term of the past ideation phase' do
          project.phases.last.update!(end_at: nil, input_term: 'option')
          project.phases.first.update!(input_term: 'issue')
          expect(idea.input_term).to eq 'issue'
        end
      end

      context 'when there is no active ideation or budgeting phase' do
        context 'when the idea does not belong to any phase' do
          # The project and the phase are given an input_term to describe that they
          # do not provide the input_term for the idea without phases.
          let(:project) { create(:project_with_past_ideation_and_current_information_phase) }
          let(:phase) { project.phases.last }
          let(:idea) { build(:idea, project: project, phases: []) }

          it 'returns the default input_term' do
            phase.update!(input_term: 'option')
            expect(idea.input_term).to eq 'idea'
          end
        end

        context 'when the idea belongs to one phase' do
          let(:project) { create(:project_with_past_ideation_and_current_information_phase) }
          let(:past_phase) { project.phases.detect { |phase| phase.participation_method == 'ideation' } }
          let(:idea) { build(:idea, project: project, phases: [past_phase]) }

          it 'returns the default input_term' do
            past_phase.update!(input_term: 'question')
            expect(idea.input_term).to eq 'question'
          end
        end

        context 'when the idea belongs to two phases and the current time is in-between phases' do
          let(:project) { create(:project_with_past_ideation_and_future_ideation_phase) }
          let(:past_phase) { project.phases.min_by(&:start_at) }
          let(:future_phase) { project.phases.max_by(&:start_at) }
          let(:idea) { build(:idea, project: project, phases: [past_phase, future_phase]) }

          it 'returns the input_term of the past phase' do
            past_phase.update!(input_term: 'option')
            future_phase.update!(input_term: 'question')
            expect(idea.input_term).to eq 'option'
          end
        end

        context 'when the idea belongs to two phases and the current time is before the first phase' do
          let(:project) { create(:project_with_two_future_ideation_phases) }
          let(:past_phase1) { project.phases.min_by(&:start_at) }
          let(:past_phase2) { project.phases.max_by(&:start_at) }
          let(:idea) { build(:idea, project: project, phases: [past_phase1, past_phase2]) }

          it 'returns the input_term of the first phase' do
            past_phase1.update!(input_term: 'option')
            past_phase2.update!(input_term: 'question')
            expect(idea.input_term).to eq 'option'
          end
        end

        context 'when the idea belongs to two phases and the current time is after the last phase' do
          let(:project) { create(:project_with_two_past_ideation_phases) }
          let(:future_phase1) { project.phases.min_by(&:start_at) }
          let(:future_phase2) { project.phases.max_by(&:start_at) }
          let(:idea) { build(:idea, project: project, phases: [future_phase1, future_phase2]) }

          it 'returns the input_term of the last phase' do
            future_phase1.update!(input_term: 'option')
            future_phase2.update!(input_term: 'question')
            expect(idea.input_term).to eq 'question'
          end
        end

        context 'when the idea belongs to an ideation phase, and the current phase is information' do
          let(:project) { create(:project_with_past_ideation_and_current_information_phase) }
          let(:ideation_phase) { project.phases.first }
          let(:information_phase) { project.phases.last }
          let(:idea) { create(:idea, project: project, phases: [ideation_phase]) }

          it 'returns the input_term of the ideation phase' do
            information_phase.update!(input_term: 'issue')
            ideation_phase.update!(input_term: 'question')
            expect(idea.reload.input_term).to eq 'question'
          end
        end
      end
    end
  end

  context 'with custom fields' do
    context 'when creating ideas' do
      let(:idea) { build(:idea) }

      %i[create publication].each do |validation_context|
        context "on #{validation_context}" do
          it 'can persist an idea with invalid field values' do
            idea.custom_field_values = { 'nonexisting_field' => 22 }
            expect(idea.valid?(validation_context)).to be true
          end
        end
      end
    end

    context 'when updating ideas' do
      let(:idea) { create(:idea) }

      %i[update publication].each do |validation_context|
        context "on #{validation_context}" do
          it 'can persist an idea with invalid field values' do
            idea.custom_field_values = { 'nonexisting_field' => 65 }
            expect(idea.valid?(validation_context)).to be true
          end
        end
      end
    end

    describe '#convert_wkt_geo_custom_field_values_to_geojson' do
      let(:project) { create(:project_with_active_native_survey_phase) }
      let(:active_phase) { project.phases.first }
      let(:custom_form) { create(:custom_form, participation_context: active_phase) }
      let!(:point_field) { create(:custom_field_point, key: 'point_field', resource: custom_form) }
      let!(:line_field) { create(:custom_field_line, key: 'line_field', resource: custom_form) }
      let!(:polygon_field) { create(:custom_field_polygon, key: 'polygon_field', resource: custom_form) }
      let(:idea) { build(:idea, creation_phase: active_phase) }

      it 'converts valid wkt strings to GeoJSON' do
        idea.custom_field_values = {
          point_field: 'POINT (4.31 50.85)',
          line_field: 'LINESTRING (4.30 50.85, 4.660 51.15)',
          polygon_field: 'POLYGON ((4.3 50.85, 4.31 50.85, 4.31 50.86, 4.3 50.85))'
        }
        idea.send(:convert_wkt_geo_custom_field_values_to_geojson)
        expect(idea.custom_field_values).to eq({
          'point_field' => { 'type' => 'Point', 'coordinates' => [4.31, 50.85] },
          'line_field' => { 'type' => 'LineString', 'coordinates' => [[4.3, 50.85], [4.66, 51.15]] },
          'polygon_field' => {
            'type' => 'Polygon',
            'coordinates' => [[[4.3, 50.85], [4.31, 50.85], [4.31, 50.86], [4.3, 50.85]]]
          }
        })
      end

      it 'does not mutate non-string values (e.g. GeoJSON)' do
        idea.custom_field_values = {
          polygon_field: {
            type: 'Polygon',
            coordinates: [[[4.3, 50.85], [4.31, 50.85], [4.31, 50.86], [4.3, 50.85]]]
          }
        }

        idea.send(:convert_wkt_geo_custom_field_values_to_geojson)

        expect(idea.custom_field_values).to eq({
          'polygon_field' => {
            'type' => 'Polygon',
            'coordinates' => [[[4.3, 50.85], [4.31, 50.85], [4.31, 50.86], [4.3, 50.85]]]
          }
        })
      end

      it 'adds closing coordinates to polygon if not in wkt string' do
        idea.custom_field_values = { polygon_field: 'POLYGON ((4.3 50.85, 4.31 50.85, 4.31 50.86))' }
        idea.send(:convert_wkt_geo_custom_field_values_to_geojson)

        expect(idea.custom_field_values).to eq({
          'polygon_field' => {
            'type' => 'Polygon',
            'coordinates' => [[[4.3, 50.85], [4.31, 50.85], [4.31, 50.86], [4.3, 50.85]]]
          }
        })
      end

      it 'raises error for an invalid coordinate in wkt string' do
        idea.custom_field_values = { point_field: 'POINT (4.31)' }

        expect { idea.send(:convert_wkt_geo_custom_field_values_to_geojson) }
          .to raise_error(RGeo::Error::ParseError, 'Numeric expected but :end found.')
      end

      it 'raises error for an insufficient coordinates in wkt string' do
        idea.custom_field_values = { line_field: 'LINESTRING (4.30 50.85)' }

        expect { idea.send(:convert_wkt_geo_custom_field_values_to_geojson) }
          .to raise_error(RGeo::Error::InvalidGeometry, 'LineString Cannot Have 1 Point')
      end

      it 'raises error for missing parentheses in wkt string' do
        idea.custom_field_values = { polygon_field: 'POLYGON (4.3 50.85, 4.31 50.85, 4.31 50.86)' }

        expect { idea.send(:convert_wkt_geo_custom_field_values_to_geojson) }
          .to raise_error(RGeo::Error::ParseError, ':begin expected but 4.3 found.')
      end
    end
  end

  context 'creation_phase' do
    before { create(:idea_status_proposed) }

    it 'is invalid for a phase that does not belong to the input\'s project' do
      project = create(:project_with_active_native_survey_phase)
      response = build(:idea, project: project, creation_phase: create(:native_survey_phase))
      expect(response).to be_invalid
      expect(response.errors.details).to eq({ creation_phase: [{ error: :invalid_project }] })
    end

    it 'is valid when nil and in a timeline project' do
      project = create(:project_with_active_native_survey_phase)
      idea = build(:idea, project: project, creation_phase: nil)
      expect(idea).to be_valid
    end

    it 'is valid for non-transitive participation methods in a timeline project' do
      project = create(:project_with_active_native_survey_phase)
      response = build(:idea, project: project, creation_phase: project.phases.first)
      expect(response).to be_valid
    end

    it 'is invalid for transitive participation methods in a timeline project' do
      project = create(:project_with_active_ideation_phase)
      idea = build(:idea, project: project, creation_phase: project.phases.first)
      expect(idea).to be_invalid
      expect(idea.errors.details).to eq({ creation_phase: [{ error: :invalid_participation_method }] })
    end

    it 'deleting a phase used as creation phase of an input fails' do
      project = create(:project_with_active_native_survey_phase)
      phase = project.phases.first
      create(:idea, project: project, creation_phase: phase)

      expect { phase.destroy }.to raise_error ActiveRecord::InvalidForeignKey
      expect(Project.count).to eq 1
      expect(Phase.count).to eq 1
      expect(described_class.count).to eq 1
    end

    it 'deleting a project with a phase used as creation phase of an input fails' do
      project = create(:project_with_active_native_survey_phase)
      phase = project.phases.first
      create(:idea, project: project, creation_phase: phase)
      project.destroy

      expect(Project.count).to eq 0
      expect(Phase.count).to eq 0
      expect(described_class.count).to eq 0
    end
  end

  context 'hooks' do
    it 'should set the author name on creation' do
      u = create(:user)
      idea = create(:idea, author: u)
      expect(idea.author_name).to eq u.full_name
    end

    it 'should generate a slug on creation' do
      idea = create(:idea, slug: nil)
      expect(idea.slug).to be_present
    end

    it 'should generate a slug when there is no current phase' do
      project = create(:project)
      create(:phase, project: project, start_at: (Time.zone.today - 10), end_at: (Time.zone.today - 5))
      create(:phase, project: project, start_at: (Time.zone.today + 5), end_at: (Time.zone.today + 10))
      idea = create(:idea, slug: nil, project: project.reload)
      expect(idea.slug).to be_present
    end

    it 'should generate a slug for a timeline project with no phases' do
      project = create(:project)
      idea = create(:idea, slug: nil, project: project)
      expect(idea.slug).to be_present
    end
  end

  context 'feedback_needed' do
    it 'should select ideas with no official feedback or no idea status change' do
      ideas = [
        create(:idea, idea_status: create(:idea_status_proposed)),
        create(:idea, idea_status: create(:idea_status, code: 'accepted')),
        create(:idea, idea_status: create(:idea_status_proposed)),
        create(:idea, idea_status: create(:idea_status, code: 'threshold_reached'))
      ]
      create(:official_feedback, idea: ideas[0])

      expect(described_class.feedback_needed.ids).to match_array [ideas[2].id, ideas[3].id]
    end
  end

  context 'published at' do
    it 'gets set immediately when creating a published idea' do
      t = Time.now
      travel_to t do
        idea = create(:idea, publication_status: 'published')
        expect(idea.published_at.to_i).to eq t.to_i
      end
    end

    it 'stays empty when creating a draft' do
      idea = create(:idea, publication_status: 'draft')
      expect(idea.published_at).to be_nil
    end

    it 'gets filled in when publishing a draft' do
      idea = create(:idea, publication_status: 'draft')
      t = Time.now + 1.week
      travel_to t do
        idea.update(publication_status: 'published')
        expect(idea.published_at.to_i).to eq t.to_i
      end
    end

    it "doesn't change again when already published once" do
      t = Time.now
      travel_to t
      idea = create(:idea, publication_status: 'published')
      travel_to t + 1.week
      idea.update(publication_status: 'draft')
      travel_to t + 1.week
      idea.update(publication_status: 'published')
      expect(idea.published_at.to_i).to eq t.to_i
      travel_back
    end
  end

  context 'idea_status' do
    it 'gets set to proposed on creation when not set' do
      create(:idea_status, code: 'proposed')
      idea = create(:idea, idea_status: nil)
      expect(idea.idea_status_id).to eq IdeaStatus.find_by(code: 'proposed').id
    end
  end

  describe 'order_new' do
    before do
      5.times do |i|
        travel_to Time.now + i.week do
          create(:idea)
        end
      end
    end

    it 'sorts from new to old by default' do
      time_serie = described_class.order_new.pluck(:published_at)
      expect(time_serie).to eq time_serie.sort.reverse
    end

    it 'sorts from new to old when asking desc' do
      time_serie = described_class.order_new(:desc).pluck(:published_at)
      expect(time_serie).to eq time_serie.sort.reverse
    end

    it 'sorts from old to new when asking asc' do
      time_serie = described_class.order_new(:asc).pluck(:published_at)
      expect(time_serie).to eq time_serie.sort
    end
  end

  describe 'order_popular' do
    before do
      5.times do |_i|
        idea = create(:idea)
        rand(20).times { create(:reaction, reactable: idea, mode: %w[up down][rand(2)]) }
      end
    end

    it 'sorts from popular to unpopular by default' do
      score_serie = described_class.order_popular.map(&:score)
      expect(score_serie).to eq score_serie.sort.reverse
    end

    it 'sorts from popular to unpopular when asking desc' do
      score_serie = described_class.order_popular(:desc).map(&:score)
      expect(score_serie).to eq score_serie.sort.reverse
    end

    it 'sorts from unpopular to popular when asking asc' do
      score_serie = described_class.order_popular(:asc).map(&:score)
      expect(score_serie).to eq score_serie.sort
    end
  end

  describe 'order_status' do
    it 'sorts from high status to low status when asked desc' do
      status_sorted = described_class.order_status(:desc).map(&:id)
      expect(status_sorted).to eq described_class.all.sort_by { |idea| idea.idea_status.ordering }.map(&:id).reverse
    end
  end

  describe 'activity_after' do
    let_it_be(:recent_idea) { create(:idea).tap { |idea| idea.update!(updated_at: 1.day.ago) } }
    let_it_be(:old_idea) { create(:idea).tap { |idea| idea.update!(updated_at: 30.days.ago) } }

    let(:recent_ideas) { described_class.activity_after(7.days.ago) }

    it 'returns recently updated ideas' do
      expect(recent_ideas.size).to eq 1
      expect(recent_ideas).to include recent_idea
      expect(recent_ideas).not_to include old_idea
    end

    it 'returns ideas with recent comments' do
      create(:comment, idea: old_idea, updated_at: 1.day.ago)
      expect(recent_ideas).to include old_idea
    end

    it 'returns ideas with recent reactions' do
      create(:reaction, reactable: old_idea, updated_at: 1.day.ago)
      expect(recent_ideas).to include old_idea
    end

    it 'does not return duplicates' do
      create(:comment, idea: recent_idea, updated_at: 1.day.ago)
      create(:comment, idea: recent_idea, updated_at: 1.day.ago)

      recent_ids = recent_ideas.pluck(:id)
      expect(recent_ids.size).to eq 1
      expect(recent_ids).to eq [recent_idea.id]
    end
  end

  describe 'idea search' do
    it 'should return results with exact prefixes' do
      create(:idea, title_multiloc: { 'nl-BE' => 'Bomen in het park' })
      srx_results = described_class.all.search_by_all 'Bomen'
      expect(srx_results.size).to be > 0
    end
  end

  describe 'body sanitizer' do
    it 'sanitizes script tags in the body' do
      idea = create(:idea, body_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script>'
      })
      expect(idea.body_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!' })
    end

    it 'sanitizes img tags in the body' do
      idea = create(:idea, body_multiloc: {
        'en' => 'Something <img src=x onerror=alert(1)>'
      })
      expect(idea.body_multiloc).to eq({ 'en' => 'Something <img src="x">' })
    end

    it "allows embedded youtube video's in the body" do
      idea = create(:idea, body_multiloc: {
        'en' => '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Bu2wNKlVRzE?showinfo=0" height="242.5" width="485" data-blot-formatter-unclickable-bound="true"></iframe>'
      })
      expect(idea.body_multiloc).to eq({ 'en' => '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/Bu2wNKlVRzE?showinfo=0" height="242.5" width="485" data-blot-formatter-unclickable-bound="true"></iframe>' })
    end
  end

  describe 'title' do
    it 'is stripped from spaces at beginning and ending' do
      idea = create(:idea, title_multiloc: { 'en' => ' my fantastic idea  ' })
      expect(idea.title_multiloc['en']).to eq 'my fantastic idea'
    end
  end

  describe 'body' do
    let(:idea) { build(:idea) }

    it 'is invalid if it has no true content' do
      idea.body_multiloc = { 'en' => '<p> </p>' }
      expect(idea).to be_invalid
    end
  end

  describe 'anonymous participation' do
    let(:author) { create(:user) }

    context 'ideas are not anonymous' do
      it 'has the same author hash for ideas in different projects when the author is the same' do
        idea1 = create(:idea, author: author)
        idea2 = create(:idea, author: author)
        expect(idea1.author_hash).to eq idea2.author_hash
      end
    end

    context 'ideas are anonymous' do
      let(:project) { create(:project) }

      it 'has no author if set to anonymous' do
        idea = create(:idea, anonymous: true)
        expect(idea.author).to be_nil
      end

      it 'has the same author hash on each idea when the author and project are the same' do
        idea1 = create(:idea, author: author, project: project, anonymous: true)
        idea2 = create(:idea, author: author, project: project, anonymous: true)
        expect(idea1.author_hash).to eq idea2.author_hash
      end

      it 'has a different author hash for ideas in different projects when the author is the same' do
        idea1 = create(:idea, author: author, anonymous: true)
        idea2 = create(:idea, author: author, anonymous: true)
        expect(idea1.author_hash).not_to eq idea2.author_hash
      end

      it 'has a different author hash for ideas in the same project when one idea is anonymous and the other is not' do
        idea1 = create(:idea, author: author, project: project)
        idea2 = create(:idea, author: author, project: project, anonymous: true)
        expect(idea1.author_hash).not_to eq idea2.author_hash
      end
    end

    context 'updating ideas' do
      it 'deletes the author if anonymous is updated' do
        idea = create(:idea)
        idea.update!(anonymous: true)
        expect(idea.author).to be_nil
      end

      it 'sets anonymous to false and changes the author hash if an author is supplied on update' do
        idea = create(:idea, anonymous: true)
        old_idea_hash = idea.author_hash
        idea.update!(author: author)
        expect(idea.author).not_to be_nil
        expect(idea.anonymous).to be false
        expect(idea.author_hash).not_to eq old_idea_hash
      end

      it 'generates a different author_hash if the author changes' do
        idea = create(:idea)
        old_idea_hash = idea.author_hash
        idea.update!(author: author)
        expect(idea.author_hash).not_to eq old_idea_hash
      end
    end
  end

  describe 'where_pmethod scope' do
    it 'returns only the ideas with a participation method that returns true for the given block' do
      create(:idea_status_proposed)
      idea = create(:idea)
      proposal = create(:proposal)
      _response = create(:native_survey_response)

      expect(described_class.where_pmethod { |pmethod| %w[ideation proposals].include? pmethod.class.method_str }).to match_array [proposal, idea]
    end
  end
end
