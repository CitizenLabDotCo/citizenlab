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
      controversial_tag = Analysis::Tag.find_by(tag_type: Analysis::AutoTaggingMethod::Controversial::TAG_TYPE)
      expect(controversial_tag).to be_present
      expect(idea1.tags).to include(controversial_tag)
      expect(idea2.tags).not_to include(controversial_tag)
    end
  end

  describe 'PlatformTopic auto_tagging' do
    it 'works' do
      analysis = create(:analysis)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'platform_topic')
      idea1 = create(:idea_with_topics, project: att.analysis.project, topics_count: 1)
      topic1 = idea1.topics.first
      idea2 = create(:idea_with_topics, project: att.analysis.project, topics_count: 1)
      topic2 = idea2.topics.first
      shared_topic = create(:topic)
      idea1.topics << shared_topic
      idea2.topics << shared_topic

      _pre_exisiting_tag = create(:tag, tag_type: 'platform_topic', analysis: analysis, name: topic1.title_multiloc.values.first)

      expect { att.execute }
        .to change(Analysis::Tag, :count).from(1).to(3)

      att.reload
      expect(att).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
      expect(idea1.tags).to include(Analysis::Tag.find_by(name: shared_topic.title_multiloc.values))
      expect(idea1.tags).to include(Analysis::Tag.find_by(name: topic1.title_multiloc.values))
      expect(idea1.tags).not_to include(Analysis::Tag.find_by(name: topic2.title_multiloc.values))
    end
  end

  describe 'Sentiment auto_tagging' do
    it 'works' do
      project = create(:project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, custom_fields: custom_form.custom_fields, project: project)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'sentiment')
      idea = create(:idea, author: create(:user, locale: 'nl-NL'), project: project, title_multiloc: { 'nl-NL' => 'Heel erg slecht' })

      positive_tag = create(:tag, tag_type: 'sentiment', analysis: analysis, name: 'sentiment +')

      mock_nlp_client = double
      expect(mock_nlp_client).to receive(:sentiment).and_return({
        'scored_labels' => [
          { 'label' => 'NEGATIVE', 'score' => 0.99 }
        ]
      })
      expect_any_instance_of(Analysis::AutoTaggingMethod::Sentiment)
        .to receive(:nlp_cloud_client_for)
        .with(anything, 'nl-NL')
        .and_return(
          mock_nlp_client
        )

      expect { att.execute }
        .to change(Analysis::Tag, :count).from(1).to(2)

      expect(att.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })

      negative_tag = Analysis::Tag.find_by(analysis: analysis, name: 'sentiment -')
      expect(negative_tag).to be_present
      expect(positive_tag.reload).to be_present

      expect(idea.tags).to match_array([negative_tag])
    end
  end

  describe 'Language detection auto_tagging' do
    it 'works' do
      project = create(:project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, custom_fields: custom_form.custom_fields, project: project)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'language')
      idea = create(:idea, project: project, title_multiloc: { en: 'Dit is niet echt in het Engels, mais en Nederlands' })
      fr_tag = create(:tag, name: 'fr', tag_type: 'language', analysis: analysis)

      mock_nlp_client = double
      expect(mock_nlp_client).to receive(:langdetection).and_return({
        'languages' => [
          {
            'nl' => 0.9142834369645996
          },
          {
            'pl' => 0.1142834369645996
          },
          {
            'fr' => 0.828571521669868466
          }
        ]
      })
      expect_any_instance_of(Analysis::AutoTaggingMethod::Language)
        .to receive(:nlp_cloud_client_for)
        .and_return(
          mock_nlp_client
        )

      expect { att.execute }
        .to change(Analysis::Tag, :count).from(1).to(2)

      expect(att.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })

      nl_tag = Analysis::Tag.find_by(analysis: analysis, name: 'nl')
      expect(nl_tag).to be_present

      expect(idea.tags).to match_array([nl_tag, fr_tag])
    end
  end
end
