# frozen_string_literal: true

require 'rails_helper'

describe Analysis::InputsFinder do
  let(:analysis) { create(:analysis) }
  let(:service) { described_class.new(analysis, @params) }
  let(:output) { service.execute }

  describe 'tags' do
    it 'filters correctly on a tag array' do
      tag1 = create(:tag, analysis: analysis)
      tag2 = create(:tag, analysis: analysis)
      tag3 = create(:tag, analysis: analysis)
      idea1 = create(:idea, project: analysis.project)
      idea2 = create(:idea, project: analysis.project)
      idea3 = create(:idea, project: analysis.project)
      _idea4 = create(:idea, project: analysis.project)
      create(:tagging, input: idea1, tag: tag1)
      create(:tagging, input: idea2, tag: tag1)
      create(:tagging, input: idea2, tag: tag2)
      create(:tagging, input: idea3, tag: tag3)
      @params = { tag_ids: [tag1.id, tag2.id] }
      expect(output).to contain_exactly(idea1, idea2)
    end

    it 'filters correctly on the empty array' do
      tag1 = create(:tag, analysis: analysis)
      idea1 = create(:idea, project: analysis.project)
      idea2 = create(:idea, project: analysis.project)
      create(:tagging, input: idea1, tag: tag1)
      @params = { tag_ids: [] }
      expect(output).to contain_exactly(idea2)
    end
  end

  describe 'search' do
    it 'filters correctly' do
      idea1 = create(:idea, project: analysis.source_project, title_multiloc: { en: 'some needle in a haystack' })
      _idea2 = create(:idea, project: analysis.source_project, title_multiloc: { en: 'some candy in a haystack' })
      @params = { search: 'needle' }
      expect(output).to contain_exactly(idea1)
    end
  end

  describe 'published_at' do
    it 'filters correctly' do
      _idea1 = create(:idea, project: analysis.source_project, published_at: '2019-01-01')
      idea2 = create(:idea, project: analysis.source_project, published_at: '2020-01-01')
      idea3 = create(:idea, project: analysis.source_project, published_at: '2021-01-01')
      _idea4 = create(:idea, project: analysis.source_project, published_at: '2022-01-01')
      @params = { published_at_from: '2020-01-01', published_at_to: '2021-01-01' }
      expect(output).to contain_exactly(idea2, idea3)
    end
  end

  describe 'reactions' do
    it 'filters correctly' do
      _idea1 = create(:idea, project: analysis.source_project, likes_count: 0, dislikes_count: 1)
      idea2 = create(:idea, project: analysis.source_project, likes_count: 10, dislikes_count: 2)
      _idea3 = create(:idea, project: analysis.source_project, likes_count: 20, dislikes_count: 3)
      _idea4 = create(:idea, project: analysis.source_project, likes_count: 30, dislikes_count: 4)
      @params = { reactions_from: 10, reactions_to: 22 }
      expect(output).to contain_exactly(idea2)
    end
  end

  describe 'comments' do
    it 'filters correctly' do
      _idea1 = create(:idea, project: analysis.source_project, comments_count: 1)
      _idea2 = create(:idea, project: analysis.source_project, comments_count: 2)
      idea3 = create(:idea, project: analysis.source_project, comments_count: 3)
      idea4 = create(:idea, project: analysis.source_project, comments_count: 4)
      @params = { comments_from: 3, comments_to: 4 }
      expect(output).to contain_exactly(idea3, idea4)
    end
  end

  describe 'votes' do
    it 'filters correctly' do
      idea1 = create(:idea, project: analysis.source_project, votes_count: 1)
      idea2 = create(:idea, project: analysis.source_project, votes_count: 2)
      _idea3 = create(:idea, project: analysis.source_project, votes_count: 3)
      _idea4 = create(:idea, project: analysis.source_project, votes_count: 4)
      @params = { votes_from: 0, votes_to: 2 }
      expect(output).to contain_exactly(idea1, idea2)
    end
  end

  describe 'author_custom_<uuid>[]' do
    it 'filters correctly on custom_field with input_type select' do
      cf = create(:custom_field_select, :with_options)
      author1 = create(:user, custom_field_values: { cf.key => cf.options[0].key })
      author2 = create(:user, custom_field_values: { cf.key => cf.options[1].key })
      idea1 = create(:idea, project: analysis.source_project, author: author1)
      _idea2 = create(:idea, project: analysis.source_project, author: author2)
      _idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [cf.options[0].key] }
      expect(output).to contain_exactly(idea1)
    end

    it 'filters correctly on custom_field with input_type date' do
      cf = create(:custom_field_date)
      author1 = create(:user, custom_field_values: { cf.key => '2021-01-01' })
      author2 = create(:user, custom_field_values: { cf.key => '2022-01-01' })
      author3 = create(:user, custom_field_values: {})
      idea1 = create(:idea, project: analysis.source_project, author: author1)
      _idea2 = create(:idea, project: analysis.source_project, author: author2)
      _idea3 = create(:idea, project: analysis.source_project, author: author3)
      @params = { "author_custom_#{cf.id}": ['2021-01-01'] }
      expect(output).to contain_exactly(idea1)
    end

    it 'filters correctly on custom_field with input_type multiselect' do
      cf = create(:custom_field_multiselect, :with_options)
      author1 = create(:user, custom_field_values: { cf.key => [cf.options[0].key, cf.options[1].key] })
      author2 = create(:user, custom_field_values: { cf.key => [cf.options[0].key] })
      idea1 = create(:idea, project: analysis.source_project, author: author1)
      _idea2 = create(:idea, project: analysis.source_project, author: author2)
      _idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [cf.options[1].key] }
      expect(output).to contain_exactly(idea1)
    end

    it 'filters correctly on custom_field with input_type number' do
      cf = create(:custom_field_number)
      author1 = create(:user, custom_field_values: { cf.key => 10 })
      author2 = create(:user, custom_field_values: { cf.key => 20 })
      author3 = create(:user, custom_field_values: { cf.key => 30 })
      idea1 = create(:idea, project: analysis.source_project, author: author1)
      _idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project, author: author3)
      _idea4 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [10, 30] }
      expect(output).to contain_exactly(idea1, idea3)
    end

    it 'errors when the parameter is not an array' do
      @params = { 'author_custom_20cb54f4-ad15-4e96-86d2-10cf5a95bd29': 'some_value' }
      expect { output }.to raise_error(ArgumentError)
    end

    it 'returns items with no value on an empty array with input type select' do
      cf = create(:custom_field_date)
      author1 = create(:user, custom_field_values: { cf.key => '2021-01-01' })
      author2 = create(:user, custom_field_values: { cf.key => nil })
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [] }
      expect(output).to contain_exactly(idea2, idea3)
    end

    it 'returns items with no value on an empty array with input type date' do
      cf = create(:custom_field_select, :with_options)
      author1 = create(:user, custom_field_values: { cf.key => cf.options[0] })
      author2 = create(:user, custom_field_values: { cf.key => nil })
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [] }
      expect(output).to contain_exactly(idea2, idea3)
    end

    it 'returns items with no values on an empty array with input type multiselect' do
      cf = create(:custom_field_multiselect, :with_options)
      author1 = create(:user, custom_field_values: { cf.key => [cf.options[0].key, cf.options[1].key] })
      author2 = create(:user, custom_field_values: { cf.key => [] })
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [] }
      expect(output).to contain_exactly(idea2, idea3)
    end

    it 'returns items with no value on an empty array with input type number' do
      cf = create(:custom_field_number)
      author1 = create(:user, custom_field_values: { cf.key => 1 })
      author2 = create(:user, custom_field_values: { cf.key => nil })
      author3 = create(:user, custom_field_values: {})
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project, author: author3)
      @params = { "author_custom_#{cf.id}": [] }
      expect(output).to contain_exactly(idea2, idea3)
    end
  end

  describe 'author_custom_<uuid>_from and author_custom_<uuid>_to' do
    it 'filters correctly on custom_field with input_type number' do
      cf = create(:custom_field_birthyear)
      author1 = create(:user, custom_field_values: { cf.key => 1990 })
      author2 = create(:user, custom_field_values: { cf.key => 2000 })
      author3 = create(:user, custom_field_values: { cf.key => 2010 })
      author4 = create(:user)
      idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      _idea3 = create(:idea, project: analysis.source_project, author: author3)
      _idea4 = create(:idea, project: analysis.source_project, author: author4)
      @params = { "author_custom_#{cf.id}_from": 1990, "author_custom_#{cf.id}_to": 2001 }
      expect(output).to contain_exactly(idea1, idea2)
    end
  end
end
