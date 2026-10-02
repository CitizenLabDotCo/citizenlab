# frozen_string_literal: true

require 'rails_helper'

describe SideFxFileService do
  let(:service) { described_class.new }

  describe 'after_destroy' do
    let(:idea) { create(:idea) }
    let(:idea_file) { create(:idea_file, idea: idea) }

    it 'removes the file reference from the idea custom field values' do
      create(:custom_field_answer, answerable: idea, key: 'some_survey_question', value: 'option2')
      create(:custom_field_answer, answerable: idea, key: 'deleted_file_upload', value: { 'id' => idea_file.id, 'name' => idea_file.name })
      create(:custom_field_answer, answerable: idea, key: 'other_file_upload', value: { 'id' => 'fake_id', 'name' => 'fake_filename' })

      service.after_destroy(idea_file)
      expect(idea.reload.custom_field_answers.pluck(:key, :value)).to contain_exactly(
        %w[some_survey_question option2],
        ['other_file_upload', { 'id' => 'fake_id', 'name' => 'fake_filename' }]
      )
    end
  end
end
