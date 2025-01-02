# frozen_string_literal: true

require 'rails_helper'
require 'uri'

describe Analytics::QueryRunnerService do
  describe '#run' do
    before_all do
      create(:dimension_type)
      create(:dimension_type, name: 'initiative')
    end

    it 'return the ID field for each post' do
      ideas = create_list(:idea, 5)
      query_param = { fact: 'post', fields: 'id' }
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, * = runner.run(query)

      expect(results).to match_array(ideas.map { |idea| { 'id' => idea.id } })
    end

    it 'return groups with aggregations' do
      idea = create(:idea)
      create_list(:reaction, 2, reactable: idea)

      query_param = {
        fact: 'post',
        groups: 'dimension_type.name',
        aggregations: {
          reactions_count: %w[sum]
        }
      }
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, * = runner.run(query)

      expected_result = [{ 'dimension_type.name' => 'idea', 'sum_reactions_count' => 2 }]
      expect(results).to match_array expected_result
    end

    it 'return filtered ideas count' do
      create(:idea)

      query_param = {
        fact: 'post',
        filters: {
          'dimension_type.name': 'idea'
        },
        aggregations: {
          all: 'count'
        }
      }
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, * = runner.run(query)
      expect(results).to eq([{ 'count' => 1 }])
    end

    it 'return first two sorted posts' do
      ideas = create_list(:idea, 5)

      query_param = {
        fact: 'post',
        fields: 'id',
        sort: { id: 'ASC' }
      }
      query = Analytics::Query.new(query_param)

      runner = described_class.new
      results, * = runner.run(query)
      posts = ideas
        .sort_by { |p| p[:id] }
        .map { |p| { 'id' => p.id } }
      expect(results).to eq(posts)
    end

    it 'returns 0 when no data' do
      query_param = {
        aggregations: {
          all: 'count',
          'dimension_date_first_action.date': 'first'
        },
        fact: 'visit'
      }

      query = Analytics::Query.new(query_param)

      results, * = described_class.new.run(query)
      expect(results).to eq([{ 'count' => 0, 'first_dimension_date_first_action_date' => nil }])
    end

    context 'result limiting and paging' do
      before_all do
        create_list(:idea, 10)
      end

      def build_query(size = 1, number = 1)
        {
          fact: 'post',
          fields: 'id',
          sort: { id: 'ASC' },
          page: { size: size, number: number }
        }
      end

      it 'returns the first page of 2 items from 10 posts' do
        query_param = build_query(2, 1)
        runner = described_class.new
        results, pagination = runner.run(Analytics::Query.new(query_param))

        expect(results.length).to eq(2)
        expect(results.first['id']).to eq(Idea.order(:id).first.id)

        expect(URI.decode_www_form(pagination[:self]).to_h['query[page][number]']).to eq('1')
        expect(URI.decode_www_form(pagination[:first]).to_h['query[page][number]']).to eq('1')
        expect(pagination[:prev]).to be_nil
        expect(URI.decode_www_form(pagination[:next]).to_h['query[page][number]']).to eq('2')
        expect(URI.decode_www_form(pagination[:last]).to_h['query[page][number]']).to eq('5')
      end

      it 'returns the second page of 3 items from 10 posts' do
        query_param = build_query(3, 2)
        runner = described_class.new
        results, pagination = runner.run(Analytics::Query.new(query_param))

        expect(results.length).to eq(3)
        expect(results.first['id']).to eq(Idea.order(:id).fourth.id)
        expect(results.second['id']).to eq(Idea.order(:id).fifth.id)

        expect(URI.decode_www_form(pagination[:self]).to_h['query[page][number]']).to eq('2')
        expect(URI.decode_www_form(pagination[:first]).to_h['query[page][number]']).to eq('1')
        expect(URI.decode_www_form(pagination[:prev]).to_h['query[page][number]']).to eq('1')
        expect(URI.decode_www_form(pagination[:next]).to_h['query[page][number]']).to eq('3')
        expect(URI.decode_www_form(pagination[:last]).to_h['query[page][number]']).to eq('4')
      end

      it 'returns nothing if the page number is too high for the size' do
        query_param = build_query(5, 3)
        runner = described_class.new
        results, pagination = runner.run(Analytics::Query.new(query_param))

        expect(results).to eq([])

        expect(URI.decode_www_form(pagination[:self]).to_h['query[page][number]']).to eq('3')
        expect(URI.decode_www_form(pagination[:first]).to_h['query[page][number]']).to eq('1')
        expect(URI.decode_www_form(pagination[:prev]).to_h['query[page][number]']).to eq('2')
        expect(pagination[:next]).to be_nil
        expect(URI.decode_www_form(pagination[:last]).to_h['query[page][number]']).to eq('2')
      end
    end
  end
end
