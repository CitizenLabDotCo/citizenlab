# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UpdateActivityJob do
  subject(:job) { described_class.new }

  describe '#run' do
    let(:project) { create(:project) }
    let(:user) { create(:admin) }
    let(:activity) do
      create(
        :activity,
        item: project,
        user: user,
        action: 'changed',
        payload: {
          change: {
            title_multiloc: [{ en: 'original title' }, { en: 'edited title' }],
            updated_at: [2.days.ago.to_i, 1.day.ago.to_i]
          }
        }
      )
    end

    it 'updates an activity payload to include the serialized item' do
      project.update!(title_multiloc: { en: 'final title' })
      serialized_project = SideFxProjectService.new.clean_time_attributes(project.attributes)
      job.run(activity, serialized_project, 'project')
      updated_payload = activity.reload.payload

      expect(updated_payload['change']).to eq(
        {
          'title_multiloc' => [{ 'en' => 'original title' }, { 'en' => 'edited title' }],
          'updated_at' => [2.days.ago.to_i, 1.day.ago.to_i]
        }
      )
      expect(updated_payload['project']).to eq(serialized_project)
      expect(updated_payload['project']['title_multiloc']).to eq('en' => 'final title')
    end
  end
end
