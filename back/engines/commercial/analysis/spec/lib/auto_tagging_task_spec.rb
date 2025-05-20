# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Analysis::AutoTaggingTask do
  describe 'Controversial auto_tagging' do
    it 'works' do
      att = create(:auto_tagging_task, state: 'queued', auto_tagging_method: 'controversial', filters: { 'reactions_from' => 101 })
      idea1 = create(:idea, project: att.analysis.project, likes_count: 100, dislikes_count: 100)
      idea2 = create(:idea, project: att.analysis.project, likes_count: 50, dislikes_count: 50)
      idea3 = create(:idea, project: att.analysis.project, likes_count: 100, dislikes_count: 0)

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
      expect(idea1.taggings.first.background_task).to eq att
      expect(idea2.tags).not_to include(controversial_tag)
      expect(idea3.tags).not_to include(controversial_tag)
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
      expect(idea1.taggings.first.background_task).to eq att
      expect(idea1.tags).to include(Analysis::Tag.find_by(name: topic1.title_multiloc.values))
      expect(idea1.tags).not_to include(Analysis::Tag.find_by(name: topic2.title_multiloc.values))
    end
  end

  describe 'Sentiment auto_tagging' do
    it 'works' do
      project = create(:single_phase_ideation_project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'sentiment')
      idea = create(:idea, author: create(:user, locale: 'nl-NL'), project: project, title_multiloc: { 'nl-NL' => 'Heel erg slecht' })

      positive_tag = create(:tag, tag_type: 'sentiment', analysis: analysis, name: 'sentiment +')

      mock_nlp_client = instance_double(NLPCloud::Client)
      expect(mock_nlp_client).to receive(:sentiment).and_return({
        'scored_labels' => [
          { 'label' => 'NEGATIVE', 'score' => 0.99 }
        ]
      })
      expect_any_instance_of(Analysis::AutoTaggingMethod::Sentiment)
        .to receive(:nlp_cloud_client_for)
        .with(anything, 'nl-NL')
        .and_return(mock_nlp_client)

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
      expect(idea.taggings.first.background_task).to eq att
    end
  end

  describe 'Language detection auto_tagging' do
    it 'works' do
      project = create(:single_phase_ideation_project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'language')
      idea = create(:idea, project: project, title_multiloc: { en: 'Dit is niet echt in het Engels, mais en Nederlands' })
      fr_tag = create(:tag, name: 'fr', tag_type: 'language', analysis: analysis)

      mock_nlp_client = instance_double(NLPCloud::Client)

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
      expect(idea.taggings.first.background_task).to eq att
    end
  end

  describe 'NlpTopic auto_tagging', use_transactional_fixtures: false do
    let(:project) { create(:single_phase_ideation_project) }
    let(:custom_form) { create(:custom_form, :with_default_fields, participation_context: project) }
    let(:analysis) { create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project) }

    it 'works' do
      task = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'nlp_topic')
      ideas = create_list(:idea, 2, project: project)

      topics_response = <<-RESPONSE
        - planets
        - bananas
      RESPONSE
      expect_any_instance_of(Analysis::LLM::GPT41)
        .to receive(:chat)
        .and_return(topics_response)

      classification_response1 = 'bananas'
      classification_response2 = 'other'
      expect_any_instance_of(Analysis::LLM::GPT4oMini)
        .to receive(:chat)
        .and_return(classification_response1, classification_response2)

      expect { task.execute }
        .to change(Analysis::Tag, :count).from(0).to(1)

      expect(task.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })

      bananas_tag = Analysis::Tag.find_by(analysis: analysis, name: 'bananas')
      other_tag = Analysis::Tag.find_by(analysis: analysis, name: 'other')
      expect(bananas_tag).to be_present
      expect(other_tag).not_to be_present
      expect(ideas.map(&:tags)).to match_array [[bananas_tag], []]
    end

    it 'passes the monolingual locale to the prompt' do
      task = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'nlp_topic')
      idea = create(:idea, project: project)

      expect_any_instance_of(Analysis::LLM::GPT41)
        .to receive(:chat)
        .and_return('- planets')

      expect_any_instance_of(Analysis::AutoTaggingMethod::NLPTopic).to receive(:classify_many!)
      expect_any_instance_of(Analysis::AutoTaggingMethod::NLPTopic)
        .to receive(:fit_inputs_in_context_window)
        .and_return([idea])

      mock_locale = instance_double(Locale)
      expect(Locale)
        .to receive(:monolingual)
        .and_return(mock_locale)
      expect(mock_locale).to receive(:language_copy).and_return('High Valyrian')
      expect_any_instance_of(Analysis::LLM::Prompt)
        .to receive(:fetch)
        .with('topic_modeling', project_title: kind_of(String), inputs_text: kind_of(String), max_topics: kind_of(Integer), language: 'High Valyrian')
        .and_call_original

      task.execute
      expect(task.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })
    end

    describe '#fit_inputs_in_context_window' do
      it 'recudes the inputs to fit in the context window' do
        stubbed_context_window = 1000
        expect_any_instance_of(Analysis::LLM::GPT41)
          .to receive(:context_window)
          .at_least(:once)
          .and_return(stubbed_context_window)

        task = create(:auto_tagging_task, analysis: analysis, auto_tagging_method: 'nlp_topic')
        model = Analysis::AutoTaggingMethod::NLPTopic.new(task)

        # Take token size of the prompt with one input + one returned topic
        ideas = [create(:idea, project: project)]
        min_size = Analysis::LLM::AzureOpenAI.token_count(model.send(:inputs_prompt, ideas, project.title_multiloc.values.first)) + Analysis::AutoTaggingMethod::NLPTopic::TOKENS_PER_TOPIC

        # Check how many more inputs can fit and triple that amount
        remaining_tokens = stubbed_context_window - min_size
        tokens_per_input = Analysis::LLM::AzureOpenAI.token_count(Analysis::InputToText.new(analysis.associated_custom_fields).format_all(ideas))
        fit_ideas_count = (remaining_tokens / tokens_per_input.to_f).ceil
        ideas += create_list(:idea, (fit_ideas_count * 3), project: project)

        # The remaining inputs should be somewhere between half the inputs that can fit and half the tripled inputs
        filtered_ideas = model.send(:fit_inputs_in_context_window, ideas, project.title_multiloc.values.first)
        expect(filtered_ideas.size).to be_between((fit_ideas_count / 2), (ideas.size / 2))
      end
    end
  end

  describe 'LabelClassification auto_tagging' do
    it 'works' do
      project = create(:single_phase_ideation_project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project)
      tags = create_list(:tag, 3, analysis: analysis)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'label_classification', tags_ids: [tags[0].id, tags[1].id], filters: { search: 'world' })
      idea1 = create(:idea, project: project, title_multiloc: { en: 'Football is the greatest sport in the world' })
      idea2 = create(:idea, project: project, title_multiloc: { en: 'This does contain world, but is already tagged so should not be auto-tagged' })
      create(:tagging, input: idea2, tag: tags[0])
      _idea3 = create(:idea, project: project, title_multiloc: { en: 'This does not contain w o r l d, so it should not be auto-tagged' })

      expect_any_instance_of(Analysis::LLM::GPT4oMini)
        .to receive(:chat)
        .and_return(tags[0].name)

      expect { att.execute }
        .to change(Analysis::Tagging, :count).from(1).to(2)

      expect(att.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })

      expect(idea1.tags).to eq([tags[0]])
      expect(idea1.taggings.first.background_task).to eq(att)
    end

    it 'propagates errors and aborts' do
      project = create(:single_phase_ideation_project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project)
      tags = create_list(:tag, 3, analysis: analysis)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'label_classification', tags_ids: [tags[0].id, tags[1].id])
      create_list(:idea, 2, project: project)

      expect_any_instance_of(Analysis::LLM::GPT4oMini)
        .to receive(:chat).at_least(:once)
        .and_raise(StandardError.new('Some error'))

      expect { att.execute }
        .not_to change(Analysis::Tagging, :count)
      expect(att.reload).to have_attributes({
        state: 'failed',
        progress: nil
      })
    end

    it 'includes the topics field for ideation' do
      topic = create(:topic, title_multiloc: { 'en' => 'Bananas' })
      project = create(:single_phase_ideation_project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project)
      tags = create_list(:tag, 3, analysis: analysis)
      task = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'label_classification', tags_ids: [tags[0].id, tags[1].id])
      create(:idea, project: project, topics: [topic])

      expect_any_instance_of(Analysis::AutoTaggingMethod::Base)
        .to receive(:classify_input_text).with(/Bananas/, anything).and_return(tags.first.name)
      task.execute
    end
  end

  describe 'FewShotClassification auto_tagging' do
    it 'works' do
      project = create(:single_phase_ideation_project)
      custom_form = create(:custom_form, :with_default_fields, participation_context: project)
      analysis = create(:analysis, main_custom_field: nil, additional_custom_fields: custom_form.custom_fields, project: project)
      tags = create_list(:tag, 3, analysis: analysis)
      att = create(:auto_tagging_task, analysis: analysis, state: 'queued', auto_tagging_method: 'few_shot_classification', tags_ids: [tags[0].id, tags[1].id])
      idea1 = create(:idea, project: project, title_multiloc: { en: 'Football is the greatest sport in the world' })
      idea2 = create(:idea, project: project, title_multiloc: { en: 'We should have a dancing stage in the parc' })
      idea3 = create(:idea, project: project, title_multiloc: { en: 'We need more houses' })
      create(:tagging, input: idea3, tag: tags[0])

      mock_llm = instance_double(Analysis::LLM::GPT41)

      expect_any_instance_of(Analysis::AutoTaggingMethod::FewShotClassification).to receive(:gpt4).and_return(mock_llm)
      expect(mock_llm).to receive(:chat) do |prompt|
        expect(prompt).to include(tags[0].name, tags[1].name, 'other')
        expect(prompt).to include('other')
        expect(prompt).to include('Football is the greatest sport in the world').once
        expect(prompt).to include('We need more houses').once

        # There's no guarantee on the order of ideas in the prompt, so we reorder them to
        # be able to write consistent expectations in the rest of the test.
        idea1, idea2 = [idea1, idea2].sort_by { |i| prompt.index(i.title_multiloc['en']) }
      end.and_return("#{tags[0].name}\n   #{tags[1].name.upcase}")

      expect { att.execute }
        .to change(Analysis::Tagging, :count).from(1).to(3)

      expect(att.reload).to have_attributes({
        state: 'succeeded',
        progress: nil
      })

      expect(idea1.tags).to eq([tags[0]])
      expect(idea1.taggings.first.background_task).to eq(att)
      expect(idea2.tags).to eq([tags[1]])
      expect(idea2.taggings.first.background_task).to eq(att)
    end
  end
end
