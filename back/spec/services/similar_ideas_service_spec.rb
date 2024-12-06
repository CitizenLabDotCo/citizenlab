require 'rails_helper'

describe SimilarIdeasService do
  let(:embeddings) { JSON.parse(File.read('spec/fixtures/word_embeddings.json')) }
  let(:idea) { create(:embeddings_similarity, embedding: embeddings['pizza']).embeddable }
  let(:service) { described_class.new(idea) }

  describe 'similar_ideas' do
    let!(:idea_burger) { create(:embeddings_similarity, embedding: embeddings['burger']).embeddable }
    let!(:idea_moon) { create(:embeddings_similarity, embedding: embeddings['moon']).embeddable }
    let!(:idea_bats) { create(:embeddings_similarity, embedding: embeddings['bats']).embeddable }

    it 'returns the ideas from most to least similar' do
      result = service.similar_ideas
      expect(result.ids).to eq [idea_burger.id, idea_bats.id, idea_moon.id]
    end

    it 'does not include ideas outside the given scope' do
      result = service.similar_ideas(scope: Idea.where.not(id: idea_burger.id))
      expect(result.ids).to eq [idea_bats.id, idea_moon.id]
      expect(result.ids).not_to include(idea_burger.id)
    end

    it 'applies the limit' do
      result = service.similar_ideas(limit: 2)
      expect(result.ids.size).to eq 2
      expect(result.ids).to eq [idea_burger.id, idea_bats.id]
    end

    it 'matches on the embedded_attributes' do
      embedded_attributes = 'last_paragraph'
      idea.embeddings_similarities.first.update!(embedded_attributes:)
      idea_burger.embeddings_similarities.first.update!(embedded_attributes:)
      idea_bats.embeddings_similarities.first.update!(embedded_attributes:)
      result = service.similar_ideas(embedded_attributes:)
      expect(result.ids).to eq [idea_burger.id, idea_bats.id]
    end

    it 'returns an empty scope if the idea has no embeddings' do
      idea.embeddings_similarities.destroy_all
      result = service.similar_ideas
      expect(result.ids).to eq []
    end
  end

  # describe 'upsert_embedding!' do
  #   it 'creates a new embeddings_similarity if it does not exist' do
  #     expect { service.upsert_embedding! }.to change { EmbeddingsSimilarity.count }.by(1)
  #   end

  #   it 'updates the embedding if it already exists' do
  #     service.upsert_embedding!
  #     expect { service.upsert_embedding! }.not_to change { EmbeddingsSimilarity.count }
  #   end

  #   it 'uses the default embedded_attributes' do
  #     service.upsert_embedding!
  #     expect(EmbeddingsSimilarity.last.embedded_attributes).to eq 'title_body'
  #   end

  #   it 'uses the given embedded_attributes' do
  #     service.upsert_embedding!(embedded_attributes: 'last_paragraph')
  #     expect(EmbeddingsSimilarity.last.embedded_attributes).to eq 'last_paragraph'
  #   end
  # end

  # describe 'embeddings_text' do
  #   it 'returns the title and body text' do
  #     expect(service.embeddings_text).to eq "Pizza\n\nPizza is a yeasted flatbread typically topped with tomato sauce and cheese and baked in an oven."
  #   end

  #   it 'uses the author locale' do
  #     idea.author.update!(locale: 'fr-FR')
  #     expect(service.embeddings_text).to eq "Pizza\n\nPizza est un pain plat levé typiquement recouvert de sauce tomate et de fromage et cuit au four."
  #   end

  #   it 'truncates the text to 2048 characters' do
  #     idea.update!(title_multiloc: { 'en' => 'a' * 1024 }, body_multiloc: { 'en' => 'b' * 1024 })
  #     expect(service.embeddings_text.size).to eq 2048
  #   end
  # end
end
