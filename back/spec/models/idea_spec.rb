# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idea, type: :model do
  context 'associations' do
    it { is_expected.to have_many(:votes) }
  end

  context 'Default factory' do
    it 'is valid' do
      expect(build(:idea)).to be_valid
    end

    it 'can create an idea without author' do
      expect(build(:idea, author: nil).valid?(:create)).to be true
    end

    it 'cannot create an idea without author on publication' do
      idea = build(:idea, author: nil)
      expect(idea.valid?(:publication)).to be false
      expect(idea.errors.details).to eq({ author: [{ error: :blank }] })
    end

    context 'without custom form' do
      it 'can publish an idea without custom fields' do
        project = create :project
        project.custom_form&.destroy!
        idea = build :idea, project: project, custom_field_values: {}
        expect(idea.save(context: :publication)).to be true
      end
    end
  end

  describe '#custom_form' do
    context 'in a continuous project when the form has been defined' do
      let(:project) { create :continuous_project }
      let!(:project_form) { create :custom_form, participation_context: project }
      let(:idea) { build(:idea, project: project) }

      it 'returns the form of the project' do
        expect(idea.custom_form).to eq project_form
      end
    end

    context 'in a continuous project when the form has not been defined yet' do
      let(:project) { create :continuous_project }
      let(:idea) { build(:idea, project: project) }

      it 'returns a new form' do
        form = idea.custom_form
        expect(form).to be_instance_of CustomForm
        expect(form).to be_new_record
      end
    end

    context 'in a timeline project when created in a phase and a form has been defined' do
      let(:project) { create :project_with_future_native_survey_phase }
      let(:phase) { project.phases.first }
      let!(:phase_form) { create :custom_form, participation_context: phase }
      let(:idea) { build(:idea, project: project, creation_phase: phase) }

      it 'returns the form of the phase in which the input was created' do
        expect(idea.custom_form).to eq phase_form
      end
    end

    context 'in a timeline project when created in a phase and a form has not been defined yet' do
      let(:project) { create :project_with_future_native_survey_phase }
      let(:phase) { project.phases.first }
      let(:idea) { build(:idea, project: project, creation_phase: phase) }

      it 'returns a new form' do
        form = idea.custom_form
        expect(form).to be_instance_of CustomForm
        expect(form).to be_new_record
      end
    end

    context 'in a timeline project when created outside a phase' do
      let(:project) { create :project_with_future_native_survey_phase }
      let!(:project_form) { create :custom_form, participation_context: project }
      let(:phase) { project.phases.first }
      let!(:phase_form) { create :custom_form, participation_context: phase }
      let(:idea) { build(:idea, project: project) }

      it 'returns the form of the project' do
        expect(idea.custom_form).to eq project_form
      end
    end
  end

  context 'with custom fields' do
    context 'when creating ideas' do
      let(:idea) { build :idea }

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
      let(:idea) { create :idea }

      %i[update publication].each do |validation_context|
        context "on #{validation_context}" do
          it 'can persist an idea with invalid field values' do
            idea.custom_field_values = { 'nonexisting_field' => 65 }
            expect(idea.valid?(validation_context)).to be true
          end
        end
      end
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
      project = create :project, process_type: 'timeline'
      create :phase, project: project, start_at: (Time.zone.today - 10), end_at: (Time.zone.today - 5)
      create :phase, project: project, start_at: (Time.zone.today + 5), end_at: (Time.zone.today + 10)
      idea = create :idea, slug: nil, project: project.reload
      expect(idea.slug).to be_present
    end

    it 'should generate a slug for a timeline project with no phases' do
      project = create :project, process_type: 'timeline'
      idea = create :idea, slug: nil, project: project
      expect(idea.slug).to be_present
    end
  end

  context 'feedback_needed' do
    it 'should select ideas with no official feedback or no idea status change' do
      ideas = [
        create(:idea, idea_status: create(:idea_status_proposed)),
        create(:idea, idea_status: create(:idea_status_accepted)),
        create(:idea, idea_status: create(:idea_status_proposed)),
        create(:idea, idea_status: create(:idea_status_viewed))
      ]
      create(:official_feedback, post: ideas[0])

      expect(described_class.feedback_needed.ids).to match_array [ideas[2].id]
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
      idea.update(publication_status: 'closed')
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
        rand(20).times { create(:vote, votable: idea, mode: %w[up down][rand(2)]) }
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
end
