# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::AutoTaggingTask do
  describe 'Controversial auto_tagging' do
    it 'works' do
      att = create(:auto_tagging_task, state: 'queued', auto_tagging_method: 'controversial')
      idea1 = create(:idea, project: att.analysis.project, likes_count: 100, dislikes_count: 100)
      idea2 = create(:idea, project: att.analysis.project, likes_count: 100, dislikes_count: 0)

      expect { att.execute }
        .to change(Analysis::Tag, :count).from(0).to(1)

      att.reload
      expect(att).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
      controversial_tag = Analysis::Tag.find_by(tag_type: AutoTaggingMethod::Controversial::TAG_TYPE)
      expect(controversial_tag).to be_present
      expect(idea1.tags).to include(controversial_tag)
      expect(idea2.tags).not_to include(controversial_tag)
    end
  end
end
