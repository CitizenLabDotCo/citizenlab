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

  describe 'participation_method' do
    it 'can be null for timeline projects' do
      p = create(:project_with_current_phase)
      p.presentation_mode = nil
      expect(p.save).to be true
    end

    it 'can be changed from a transitive method to another one' do
      project = create(:continuous_project, participation_method: 'ideation', voting_max_total: 17)
      project.participation_method = 'voting'
      project.voting_method = 'budgeting'
      project.voting_max_total = 1000
      project.ideas_order = 'random'
      expect(project.save).to be true
    end

    it 'cannot be changed from a transitive method to a non-transitive one' do
      project = create(:continuous_project, participation_method: 'ideation')
      project.participation_method = 'native_survey'
      project.ideas_order = nil
      expect(project.save).to be false
      expect(project.errors.details).to eq({ participation_method: [{ error: :change_not_permitted }] })
    end

    it 'cannot be changed from a non-transitive method to a transitive one' do
      project = create(:continuous_project, participation_method: 'native_survey', voting_max_total: 63)
      project.participation_method = 'voting'
      project.voting_method = 'budgeting'
      project.voting_max_total = 1000
      expect(project.save).to be false
      expect(project.errors.details).to eq({ participation_method: [{ error: :change_not_permitted }] })
    end
  end

  describe '#native_survey?' do
    it 'returns true when the participation method is native_survey' do
      project = create(:continuous_native_survey_project)
      expect(project.native_survey?).to be true
    end

    it 'returns false otherwise' do
      project = create(:continuous_project)
      expect(project.native_survey?).to be false
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
        let(:project) { build(:project, participation_method: participation_method) }

        it "returns #{expected_result}" do
          expect(project.can_contain_input?).to be expected_result
        end
      end
    end
  end

  describe 'allowed_input_topics' do
    it 'cannot have duplicate topics' do
      project = create(:project_with_allowed_input_topics)
      expect(project.projects_allowed_input_topics.create(topic: project.allowed_input_topics.first)).not_to be_valid
    end
  end
end
