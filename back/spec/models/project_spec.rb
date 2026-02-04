# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project do
  describe 'Default factory' do
    subject(:project) { build(:project) }

    it { is_expected.to be_valid }
    it { is_expected.to have_one(:review).class_name('ProjectReview').dependent(:destroy) }
    it { is_expected.to have_many(:jobs_trackers).class_name('Jobs::Tracker').dependent(:destroy) }
    it { is_expected.to validate_presence_of(:title_multiloc) }

    it 'validates presence of slug' do
      project = build(:project)
      allow(project).to receive(:generate_slug) # Stub to do nothing
      project.slug = nil
      expect(project).to be_invalid
      expect(project.errors[:slug]).to include("can't be blank")
    end

    it 'has a preview token' do
      expect(project.preview_token).to be_present
    end
  end

  describe 'Factory with topics' do
    it 'is valid' do
      expect(create(:project_with_input_topics)).to be_valid
    end

    it 'has topics' do
      expect(create(:project_with_input_topics).input_topics).not_to be_empty
    end
  end

  describe 'Factory with areas' do
    it 'is valid' do
      expect(create(:project_with_areas)).to be_valid
    end

    it 'has areas' do
      expect(create(:project_with_areas).areas).not_to be_empty
    end
  end

  describe 'Factory XL' do
    it 'is valid' do
      expect(create(:project_xl)).to be_valid
    end

    it 'has ideas' do
      expect(create(:project_xl).ideas).not_to be_empty
    end
  end

  describe 'Project without admin publication' do
    it 'is invalid' do
      project = create(:project)
      AdminPublication.where(publication: project).first.destroy!
      expect(project.reload).to be_invalid
    end
  end

  describe 'comments_count' do
    it 'remains up to date when an idea changes project' do
      p1 = create(:project)
      p2 = create(:project)
      idea = create(:idea, project: p1)
      create(:comment, idea: idea)

      expect(p1.reload.comments_count).to eq 1
      idea.update! project: p2
      expect(p1.reload.comments_count).to eq 0
      expect(p2.reload.comments_count).to eq 1
      expect(p2.reload.comments_count).to eq 1
    end
  end

  describe 'description sanitizer' do
    it 'sanitizes script tags in the description' do
      project = create(:project, description_multiloc: {
        'en' => '<p>Test</p><script>This should be removed!</script><h2>Title</h2><ul><li>A bullet</li></ul><ol type="1"><li>And a listing</li></ol>'
      })
      expect(project.description_multiloc).to eq({ 'en' => '<p>Test</p>This should be removed!<h2>Title</h2><ul><li>A bullet</li></ul><ol type="1"><li>And a listing</li></ol>' })
    end
  end

  describe 'destroy' do
    it 'can be realised' do
      project = create(:project_xl)
      expect { project.destroy }.not_to raise_error
    end

    it 'works when related impact_tracking_pageviews exist' do
      project = create(:project)
      session = create(:session)
      create(:pageview, session_id: session.id, project_id: project.id)

      expect { project.destroy }.not_to raise_error
    end
  end

  describe 'generate_slug' do
    let(:project) { build(:project, slug: nil) }

    it 'generates a slug based on the first non-empty locale' do
      project.update!(title_multiloc: { 'en' => 'my project', 'nl-BE' => 'mijn project', 'fr-BE' => 'mon projet' })
      expect(project.slug).to eq 'my-project'
    end
  end

  describe 'pmethod' do
    it 'returns an instance of ParticipationMethod::Ideation' do
      expect(build(:project).pmethod).to be_an_instance_of(ParticipationMethod::Ideation)
    end

    # There is some super hacky method on the project to make sure that the project
    # has a `.pmethod` attribute. This attribute was defaulting to the first phase
    # of the project always. This was causing bugs.
    # This test makes sure that it defaults to the current phase.
    # Still messy as hell and extremely confusing but at least now it is tested
    it 'returns correct pmethod' do
      project = create(:project)
      create(
        :native_survey_phase,
        start_at: 3.weeks.ago,
        end_at: 2.weeks.ago,
        project: project
      )
      ideation_phase = create(
        :phase,
        start_at: 1.week.ago,
        end_at: 3.weeks.from_now,
        participation_method: 'ideation',
        project: project
      )

      expect(project.pmethod.phase).to eq(ideation_phase)
    end
  end

  describe '#refresh_preview_token' do
    it 'replaces the preview token' do
      project = build(:project)
      old_token = project.preview_token

      project.refresh_preview_token

      expect(project.preview_token).to be_present
      expect(project.preview_token).not_to eq(old_token)
    end
  end

  describe "'not in draft folder' scope" do
    let!(:project1) { create(:project) }
    let!(:draft_folder) do
      create(:project_folder, admin_publication_attributes: { publication_status: 'draft' }, projects: [project1])
    end

    let!(:project2) { create(:project) }
    let!(:published_folder) do
      create(:project_folder, admin_publication_attributes: { publication_status: 'published' }, projects: [project2])
    end

    let!(:project3) { create(:project) }

    it 'returns projects not in a draft folder' do
      expect(described_class.not_in_draft_folder).to contain_exactly(project2, project3)
    end
  end

  describe "'hidden' scopes" do
    let!(:project) { create(:project) }
    let!(:hidden_project) { create(:project, hidden: true) }

    it 'returns all projects that are not hidden' do
      expect(described_class.all.count).to eq 2
    end

    it 'returns projects that are not hidden' do
      expect(described_class.not_hidden.count).to eq 1
    end
  end

  describe 'with_participation_count scope' do
    before_all do
      Analytics::PopulateDimensionsService.populate_types
    end

    let(:scope_with_count) do
      described_class
        .with_participation_count
        .select('projects.*, project_participants.participants_count')
    end

    it 'includes participation count for each project' do
      project1 = create(:project)
      project2 = create(:project)

      create_list(:idea, 3, project: project1)
      create_list(:idea, 5, project: project2)

      results = scope_with_count.where(id: [project1.id, project2.id])

      result1 = results.find { |p| p.id == project1.id }
      result2 = results.find { |p| p.id == project2.id }

      expect(result1['participants_count']).to eq(3)
      expect(result2['participants_count']).to eq(5)
    end

    it 'returns 0 for projects with no participation' do
      project = create(:project)

      result = scope_with_count.find(project.id)

      expect(result['participants_count']).to eq(0)
    end

    it 'counts distinct participants across multiple participation types' do
      project = create(:project)
      idea = create(:idea, project: project)

      # Same user participates multiple times
      create_list(:comment, 2, idea: idea)
      create_list(:reaction, 3, reactable: idea)

      result = scope_with_count.find(project.id)

      # Should count distinct participants, not total actions
      expect(result['participants_count']).to be > 1
    end
  end
end
