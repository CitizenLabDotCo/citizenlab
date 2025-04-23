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

    it 'filters correctly on the nil value, meaning inputs without tags' do
      tag1 = create(:tag, analysis: analysis)
      idea1 = create(:idea, project: analysis.project)
      idea2 = create(:idea, project: analysis.project)
      create(:tagging, input: idea1, tag: tag1)

      analysis2 = create(:analysis)
      tag2 = create(:tag, analysis: analysis2)
      create(:tagging, input: idea2, tag: tag2)

      @params = { tag_ids: [nil] }
      expect(output).to contain_exactly(idea2)
    end

    it 'combines with search filter' do
      tag1 = create(:tag, analysis: analysis)
      idea1 = create(:idea, project: analysis.project, title_multiloc: { en: 'woof woof dog dog' })
      create(:tagging, input: idea1, tag: tag1)
      @params = { tag_ids: [tag1], search: 'dog' }
      expect(output).to contain_exactly(idea1)
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

  describe 'limit' do
    it 'filters correctly' do
      _idea1 = create(:idea, project: analysis.source_project)
      _idea2 = create(:idea, project: analysis.source_project)
      _idea3 = create(:idea, project: analysis.source_project)
      _idea4 = create(:idea, project: analysis.source_project)
      @params = { limit: 1 }
      expect(output.size).to eq 1
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

    it 'returns items with no value on an array with a nil value with input type select' do
      cf = create(:custom_field_date)
      author1 = create(:user, custom_field_values: { cf.key => '2021-01-01' })
      author2 = create(:user, custom_field_values: { cf.key => nil })
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [nil] }
      expect(output).to contain_exactly(idea2, idea3)
    end

    it 'returns items with no value on an array with a nil value with input type date' do
      cf = create(:custom_field_select, :with_options)
      author1 = create(:user, custom_field_values: { cf.key => cf.options[0] })
      author2 = create(:user, custom_field_values: { cf.key => nil })
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [nil] }
      expect(output).to contain_exactly(idea2, idea3)
    end

    it 'returns items with no values on an array with a nil value with input type multiselect' do
      cf = create(:custom_field_multiselect, :with_options)
      author1 = create(:user, custom_field_values: { cf.key => [cf.options[0].key, cf.options[1].key] })
      author2 = create(:user, custom_field_values: { cf.key => [] })
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [nil] }
      expect(output).to contain_exactly(idea2, idea3)
    end

    it 'returns items with no value on on an array with a nil value with input type number' do
      cf = create(:custom_field_number)
      author1 = create(:user, custom_field_values: { cf.key => 1 })
      author2 = create(:user, custom_field_values: { cf.key => nil })
      author3 = create(:user, custom_field_values: {})
      _idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      idea3 = create(:idea, project: analysis.source_project, author: author3)
      @params = { "author_custom_#{cf.id}": [nil] }
      expect(output).to contain_exactly(idea2, idea3)
    end

    it 'works correctly with the domicile field, when passed custom_field_options for areas' do
      area = create(:area)
      cf = create(:custom_field_domicile)
      author = create(:user, custom_field_values: { cf.key => area.id })
      idea1 = create(:idea, project: analysis.source_project, author: author)
      _idea2 = create(:idea, project: analysis.source_project)
      @params = { "author_custom_#{cf.id}": [cf.options[0].key] }
      expect(output).to contain_exactly(idea1)
    end
  end

  describe 'author_custom_<uuid>_from and author_custom_<uuid>_to' do
    it 'filters correctly on custom_field with input_type number' do
      cf = create(:custom_field_birthyear)
      author1 = create(:user, custom_field_values: { cf.key => 1990 })
      author2 = create(:user, custom_field_values: { cf.key => 2000 })
      author3 = create(:user, custom_field_values: { cf.key => 2010 })
      author4 = create(:user)
      author5 = create(:user, custom_field_values: { cf.key => nil })
      idea1 = create(:idea, project: analysis.source_project, author: author1)
      idea2 = create(:idea, project: analysis.source_project, author: author2)
      _idea3 = create(:idea, project: analysis.source_project, author: author3)
      _idea4 = create(:idea, project: analysis.source_project, author: author4)
      _idea5 = create(:idea, project: analysis.source_project, author: author5)
      @params = { "author_custom_#{cf.id}_from": 1990, "author_custom_#{cf.id}_to": 2001 }
      expect(output).to contain_exactly(idea1, idea2)
    end
  end

  describe 'input_custom_<uuid>[]' do
    let_it_be(:analysis) { create(:analysis) }
    let_it_be(:custom_form) { create(:custom_form) }
    let_it_be(:custom_field_select) { create(:custom_field_select, :with_options, resource: custom_form) }
    let_it_be(:custom_field_multiselect) { create(:custom_field_multiselect, :with_options, resource: custom_form) }
    let_it_be(:custom_field_date) { create(:custom_field_date, resource: custom_form) }
    let_it_be(:custom_field_number) { create(:custom_field_number, resource: custom_form) }
    let_it_be(:custom_field_linear_scale) { create(:custom_field_linear_scale, resource: custom_form) }
    let_it_be(:custom_field_rating) { create(:custom_field_rating, resource: custom_form) }
    let_it_be(:custom_field_multiselect_image) { create(:custom_field_multiselect_image, :with_options, resource: custom_form) }

    let_it_be(:input0) { create(:idea, project: analysis.source_project) }
    let_it_be(:input1) do
      create(:idea, project: analysis.source_project, custom_field_values: {
        custom_field_select.key => custom_field_select.options[0].key,
        custom_field_multiselect.key => [custom_field_multiselect.options[0].key],
        custom_field_date.key => '2022-01-01',
        custom_field_number.key => 1,
        custom_field_linear_scale.key => 1,
        custom_field_rating.key => 1,
        custom_field_multiselect_image.key => [custom_field_multiselect_image.options[0].key]
      })
    end

    let_it_be(:input2) do
      create(:idea, project: analysis.source_project, custom_field_values: {
        custom_field_select.key => custom_field_select.options[1].key,
        custom_field_multiselect.key => [custom_field_multiselect.options[1].key],
        custom_field_date.key => '2022-01-02',
        custom_field_number.key => 2,
        custom_field_linear_scale.key => 2,
        custom_field_rating.key => 2,
        custom_field_multiselect_image.key => [custom_field_multiselect_image.options[1].key]
      })
    end

    it 'filters correctly on custom_field with input_type select' do
      @params = { "input_custom_#{custom_field_select.id}": [custom_field_select.options[0].key] }
      expect(output).to contain_exactly(input1)
    end

    it 'filters correctly on custom_field with input_type date' do
      @params = { "input_custom_#{custom_field_date.id}": ['2022-01-01'] }
      expect(output).to contain_exactly(input1)
    end

    it 'filters correctly on custom_field with input_type multiselect' do
      @params = { "input_custom_#{custom_field_multiselect.id}": [custom_field_multiselect.options[0].key, custom_field_multiselect.options[1].key] }
      expect(output).to contain_exactly(input1, input2)
    end

    it 'filters correctly on custom_field with input_type number' do
      @params = { "input_custom_#{custom_field_number.id}": [1, 2] }
      expect(output).to contain_exactly(input1, input2)
    end

    it 'filters correctly on custom_field with input_type linear_scale' do
      @params = { "input_custom_#{custom_field_linear_scale.id}": [1, 2] }
      expect(output).to contain_exactly(input1, input2)
    end

    it 'filters correctly on custom_field with input_type rating' do
      @params = { "input_custom_#{custom_field_rating.id}": [1, 2] }
      expect(output).to contain_exactly(input1, input2)
    end

    it 'filters correctly on custom_field with input_type multiselect_image' do
      @params = { "input_custom_#{custom_field_multiselect_image.id}": [custom_field_multiselect_image.options[0].key, custom_field_multiselect_image.options[1].key] }
      expect(output).to contain_exactly(input1, input2)
    end

    it 'errors when the parameter is not an array' do
      @params = { 'input_custom_20cb54f4-ad15-4e96-86d2-10cf5a95bd29': 'some_value' }
      expect { output }.to raise_error(ArgumentError)
    end

    it 'returns items with no value on an array with a nil value with input type select' do
      @params = { "input_custom_#{custom_field_select.id}": [nil] }
      expect(output).to contain_exactly(input0)
    end

    it 'returns items with no value on an array with a nil value with input type date' do
      @params = { "input_custom_#{custom_field_date.id}": [nil] }
      expect(output).to contain_exactly(input0)
    end

    it 'returns items with no values on an array with a nil value with input type multiselect' do
      @params = { "input_custom_#{custom_field_multiselect.id}": [nil] }
      expect(output).to contain_exactly(input0)
    end

    it 'returns items with no value on on an array with a nil value with input type number' do
      @params = { "input_custom_#{custom_field_number.id}": [nil] }
      expect(output).to contain_exactly(input0)
    end

    it 'returns items with no value on on an array with a nil value with input type linear_scale' do
      @params = { "input_custom_#{custom_field_linear_scale.id}": [nil] }
      expect(output).to contain_exactly(input0)
    end

    it 'returns items with no value on on an array with a nil value with input type rating' do
      @params = { "input_custom_#{custom_field_rating.id}": [nil] }
      expect(output).to contain_exactly(input0)
    end

    it 'returns items with no value on on an array with a nil value with input type multiselect_image' do
      @params = { "input_custom_#{custom_field_multiselect_image.id}": [nil] }
      expect(output).to contain_exactly(input0)
    end
  end

  describe 'input_custom_field_no_empty_values' do
    let_it_be(:custom_form) { create(:custom_form) }
    let_it_be(:custom_field_text) { create(:custom_field_text, resource: custom_form) }
    let_it_be(:analysis) { create(:analysis, main_custom_field: custom_field_text, additional_custom_fields: []) }

    let_it_be(:input0) { create(:idea, project: analysis.source_project) }
    let_it_be(:input1) do
      create(:idea, project: analysis.source_project, custom_field_values: {
        custom_field_text.key => 'value 1'
      })
    end

    let_it_be(:input2) do
      create(:idea, project: analysis.source_project, custom_field_values: {
        custom_field_text.key => 'value 2'
      })
    end

    it 'filters out custom_field with no empty values correctly' do
      @params = { input_custom_field_no_empty_values: true }
      expect(output).to contain_exactly(input1, input2)
    end
  end

  describe 'input_custom_<uuid>from/to' do
    let_it_be(:analysis) { create(:analysis) }
    let_it_be(:custom_form) { create(:custom_form) }
    let_it_be(:custom_field_select) { create(:custom_field_select, :with_options, resource: custom_form) }
    let_it_be(:custom_field_multiselect) { create(:custom_field_multiselect, :with_options, resource: custom_form) }
    let_it_be(:custom_field_date) { create(:custom_field_date, resource: custom_form) }
    let_it_be(:custom_field_number) { create(:custom_field_number, resource: custom_form) }
    let_it_be(:custom_field_linear_scale) { create(:custom_field_linear_scale, resource: custom_form) }
    let_it_be(:custom_field_rating) { create(:custom_field_rating, resource: custom_form) }

    let_it_be(:input0) { create(:idea, project: analysis.source_project) }
    let_it_be(:input1) do
      create(:idea, project: analysis.source_project, custom_field_values: {
        custom_field_select.key => custom_field_select.options[0].key,
        custom_field_multiselect.key => [custom_field_multiselect.options[0].key],
        custom_field_date.key => '2022-01-01',
        custom_field_number.key => 1,
        custom_field_linear_scale.key => 1,
        custom_field_rating.key => 1
      })
    end

    let_it_be(:input2) do
      create(:idea, project: analysis.source_project, custom_field_values: {
        custom_field_select.key => custom_field_select.options[1].key,
        custom_field_multiselect.key => [custom_field_multiselect.options[1].key],
        custom_field_date.key => '2022-01-02',
        custom_field_number.key => 2,
        custom_field_linear_scale.key => 2,
        custom_field_rating.key => 2
      })
    end

    it 'filters correctly on custom_field with input_type number' do
      @params = { "input_custom_#{custom_field_number.id}_to": 1 }
      expect(output).to contain_exactly(input1)
    end

    it 'filters correctly on custom_field with input_type linear_scale' do
      @params = { "input_custom_#{custom_field_linear_scale.id}_from": 1, "input_custom_#{custom_field_linear_scale.id}_to": 2 }
      expect(output).to contain_exactly(input1, input2)
    end

    it 'filters correctly on custom_field with input_type rating' do
      @params = { "input_custom_#{custom_field_rating.id}_from": 1, "input_custom_#{custom_field_rating.id}_to": 2 }
      expect(output).to contain_exactly(input1, input2)
    end
  end
end
