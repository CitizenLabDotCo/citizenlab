# frozen_string_literal: true

require 'rails_helper'

describe Tagging::AutomaticTaggingService do
  let(:service) { described_class.new }
  let(:task_id) { 'the-task-id'}

  before do
    @ideas = create_list(:idea, 5)

    @fish = Tagging::Tag.create(title_multiloc: { en: 'Fish' })
    @sea_lion = Tagging::Tag.create(title_multiloc: { en: 'Sea Lion' })
    @dolphin = Tagging::Tag.create(title_multiloc: { en: 'Dolphin' })
    @shark = Tagging::Tag.create(title_multiloc: { en: 'Shark' })

    @response = {
      'status' => 'SUCCESS',
      'task_id' => task_id,
      'result' => {
        'data' => {
          'final_predictions' => [
            { 'predicted_labels' => [{ 'confidence' => 0.9304072260856628, 'id' => @sea_lion.id }, { 'confidence' => 0.456, 'id' => @shark.id }], 'id' => @ideas[0].id },
            { 'predicted_labels' => [{ 'confidence' => 0.97732, 'id' => @sea_lion.id }, { 'confidence' => 0.97732, 'id' => @dolphin.id }], 'id' => @ideas[1].id },
            { 'predicted_labels' => [{ 'confidence' => 0.97732, 'id' => @fish.id }, { 'confidence' => 0.456, 'id' => @shark.id }], 'id' => @ideas[2].id },
            { 'predicted_labels' => [{ 'confidence' => 0.98663, 'id' => @sea_lion.id }], 'id' => @ideas[3].id },
            { 'predicted_labels' => [], 'id' => @ideas[4].id }
          ]
        }
      }
    }
  end

  describe 'parse_message' do
    it 'creates the tags corresponding to the response' do
      Tagging::PendingTask.create(nlp_task_id: task_id)
      service.save_tags_from_prediction(@response)
      expect(Tagging::Tagging.automatic.length).to eq 7
    end

    it 'discards the nlp response if the task is unkown' do
      # There is no PendingTask with the right task id.
      service.save_tags_from_prediction(@response)
      expect(Tagging::Tagging.automatic).to be_empty
    end
  end
end
