# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project do
  describe 'Default factory' do
    subject(:project) { build(:project) }

    it { is_expected.to be_valid }
    it { is_expected.to have_one(:review).class_name('ProjectReview').dependent(:destroy) }
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
      expect(create(:project_with_allowed_input_topics)).to be_valid
    end

    it 'has topics' do
      expect(create(:project_with_allowed_input_topics).allowed_input_topics).not_to be_empty
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

  describe 'allowed_input_topics' do
    it 'cannot have duplicate topics' do
      project = create(:project_with_allowed_input_topics)
      expect(project.projects_allowed_input_topics.create(topic: project.allowed_input_topics.first)).not_to be_valid
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
      expect(described_class.not_in_draft_folder).to match_array([project2, project3])
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
end
