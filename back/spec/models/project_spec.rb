# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project do
  describe 'Default factory' do
    it 'is valid' do
      expect(build(:project)).to be_valid
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
      create(:comment, post: idea)

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
end
