# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminApi::Schema do
  let(:context) { {} }
  let(:variables) { {} }
  let(:result) do
    res = described_class.execute(
      query_string,
      context: context,
      variables: variables
    )
    if res['errors']
      pp res
    end
    res
  end

  describe 'publicIdeas' do
    let(:query_string) do
      %|
        query publicIdeas($projects: [ID!], $topics: [ID!], $sort: IdeaSorting) {
          publicIdeas(first: 5, projects: $projects, topics: $topics, sort: $sort) {
            edges {
              node {
                id
                href
                titleMultiloc {
                  en
                  nlBe
                  frBe
                  frFr
                }
                images(first: 1) {
                  edges {
                    node {
                      smallUrl
                    }
                  }
                }
                likesCount
                dislikesCount
                commentsCount
                internalCommentsCount
              }
            }
          }
        }
      |
    end

    it 'returns all public ideas with fields' do
      create_list(:idea, 5)
      create(:idea, project: create(:private_admins_project))
      response = result
      edges = response.dig('data', 'publicIdeas', 'edges')
      expect(edges&.size).to eq 5
      expect(edges&.first&.dig('node', 'id')).to be_present
      expect(edges&.first&.dig('node', 'href')).to be_present
      expect(edges&.first&.dig('node', 'titleMultiloc')&.values&.compact&.size).to be >= 1
      expect(edges&.first&.dig('node', 'likesCount')).to be_present
      expect(edges&.first&.dig('node', 'dislikesCount')).to be_present
      expect(edges&.first&.dig('node', 'commentsCount')).to be_present
      expect(edges&.first&.dig('node', 'internalCommentsCount')).to be_present
    end

    context do
      let(:p1) { create(:project) }
      let(:p2) { create(:project) }
      let!(:i1) { create(:idea, project: p1) }
      let!(:i2) { create(:idea, project: p2) }
      let!(:i3) { create(:idea, project: p1) }
      let(:variables) { { projects: [p1.id] } }

      it 'returns public ideas in projects' do
        response = result
        edges = response.dig('data', 'publicIdeas', 'edges')
        expect(edges&.size).to eq 2
      end
    end

    context do
      let(:t1) { create(:input_topic) }
      let(:t2) { create(:input_topic) }
      let(:t3) { create(:input_topic) }
      let(:project) { create(:project, input_topics: [t1, t2, t3]) }
      let!(:i1) { create(:idea, input_topics: [t1], project: project) }
      let!(:i2) { create(:idea, input_topics: [t2], project: project) }
      let!(:i3) { create(:idea, input_topics: [t1], project: project) }
      let!(:i4) { create(:idea, input_topics: [t3, t2], project: project) }
      let(:variables) { { topics: [t1.id, t3.id] } }

      it 'returns public ideas in topics' do
        response = result
        edges = response.dig('data', 'publicIdeas', 'edges')
        expect(edges&.size).to eq 3
      end
    end
  end
end
