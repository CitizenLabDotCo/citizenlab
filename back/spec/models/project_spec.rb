# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Project, type: :model do
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
      i = create(:idea, project: p1)
      c = create(:comment, post: i)

      expect(p1.reload.comments_count).to eq 1
      i.update! project: p2
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

  describe 'participation_method' do
    it 'can be null for timeline projects' do
      p = create(:project_with_current_phase)
      p.presentation_mode = nil
      expect(p.save).to eq true
    end
  end
end
