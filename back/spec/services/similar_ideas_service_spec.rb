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

    it 'applies the distance_threshold' do
      result = service.similar_ideas(distance_threshold: 0.55)
      expect(result.ids).to eq [idea_burger.id]
    end

    it 'returns an empty scope if the idea has no embeddings' do
      idea.embeddings_similarities.destroy_all
      result = service.similar_ideas
      expect(result.ids).to eq []
    end
  end

  describe 'upsert_embedding!' do
    it 'creates a new embeddings_similarity if it does not exist' do
      idea.embeddings_similarities.destroy_all
      embedding = embeddings['moon']
      expect_any_instance_of(CohereMultilingualEmbeddings)
        .to receive(:embedding).and_return(embedding)
      idea # Load idea to start from correct EmbeddingsSimilarity.count
      expect { service.upsert_embedding! }.to change(EmbeddingsSimilarity, :count).by(1)
      expect(idea.embeddings_similarities.pluck(:embedding)).to eq [embedding]
    end

    it 'updates the embedding if it already exists' do
      embedding = embeddings['bats']
      expect_any_instance_of(CohereMultilingualEmbeddings)
        .to receive(:embedding).and_return(embedding)
      idea # Load idea to start from correct EmbeddingsSimilarity.count
      expect { service.upsert_embedding! }.not_to change(EmbeddingsSimilarity, :count)
      expect(idea.embeddings_similarities.pluck(:embedding)).to eq [embedding]
    end

    it 'creates a new embeddings_similarity if there already exists one with different embedded_attributes' do
      idea.embeddings_similarities.update_all(embedded_attributes: 'last_paragraph')
      old_embedding = idea.embeddings_similarities.first.embedding
      new_embedding = embeddings['burger']
      expect_any_instance_of(CohereMultilingualEmbeddings)
        .to receive(:embedding).and_return(new_embedding)
      idea # Load idea to start from correct EmbeddingsSimilarity.count
      expect { service.upsert_embedding! }.to change(EmbeddingsSimilarity, :count).by(1)
      expect(idea.embeddings_similarities.pluck(:embedding)).to match_array [old_embedding, new_embedding]
    end
  end

  describe 'embeddings_text' do
    let(:idea) do
      title_multiloc = { 'en' => 'Pizza' }
      body_multiloc = {
        'en' => 'Pizza is a <b>yeasted flatbread</b> typically topped with tomato sauce and cheese and baked in an oven.',
        'fr-BE' => '<b>Pizza</b> est un pain plat levé typiquement recouvert de sauce tomate et de fromage et cuit au four.'
      }
      create(:idea, title_multiloc:, body_multiloc:)
    end

    it 'returns the title and body text without HTML tags' do
      expect(service.embeddings_text).to eq "Pizza\n\nPizza is a yeasted flatbread typically topped with tomato sauce and cheese and baked in an oven."
    end

    it 'uses the author locale' do
      idea.author.update!(locale: 'fr-FR')
      expect(service.embeddings_text).to eq "Pizza\n\nPizza est un pain plat levé typiquement recouvert de sauce tomate et de fromage et cuit au four."
    end

    it 'truncates the text to 2048 characters' do
      idea.update!(title_multiloc: { 'en' => 'title' * 1000 }, body_multiloc: { 'en' => 'body' * 1000 })
      expect(service.embeddings_text.size).to eq 2048
    end
  end
end
