require 'rails_helper'

describe SimilarIdeasService do
  # pizza <=> burger = 0.5121947242188569
  # pizza <=> moon   = 0.6393773168837441
  # pizza <=> bats   = 0.5977864166605551
  let(:embeddings) { JSON.parse(File.read('spec/fixtures/word_embeddings.json')) }
  let(:idea) { create(:embeddings_similarity, embedding: embeddings['pizza'], embedded_attributes: 'body').embeddable }
  let(:service) { described_class.new(idea) }

  describe 'similar_ideas' do
    let!(:idea_burger) { create(:embeddings_similarity, embedding: embeddings['burger'], embedded_attributes: 'title').embeddable }
    let!(:idea_moon) { create(:embeddings_similarity, embedding: embeddings['moon'], embedded_attributes: 'title').embeddable }
    let!(:idea_bats) { create(:embeddings_similarity, embedding: embeddings['bats'], embedded_attributes: 'body').embeddable }

    describe do
      before do
        allow_any_instance_of(CohereMultilingualEmbeddings).to receive(:embedding) do
          embeddings['pizza']
        end
      end

      it 'returns the ideas from most to least similar' do
        EmbeddingsSimilarity.update_all(embedded_attributes: 'title')
        result = service.similar_ideas(title_threshold: 1.0, body_threshold: 1.0)
        expect(result.ids).to eq [idea_burger.id, idea_bats.id, idea_moon.id]
      end

      it 'first returns similar ideas by body, then the similar ideas by title' do
        result = service.similar_ideas(title_threshold: 1.0, body_threshold: 1.0)
        expect(result.ids).to eq [idea_bats.id, idea_burger.id, idea_moon.id]
      end

      it 'does not include ideas outside the given scope' do
        result = service.similar_ideas(scope: Idea.where.not(id: idea_burger.id), title_threshold: 1.0, body_threshold: 1.0)
        expect(result.ids).to eq [idea_bats.id, idea_moon.id]
        expect(result.ids).not_to include(idea_burger.id)
      end

      it 'excludes the current idea from results' do
        result = service.similar_ideas(title_threshold: 1.0, body_threshold: 1.0)
        expect(result.ids).not_to include(idea.id)
      end

      it 'applies the limit' do
        result = service.similar_ideas(limit: 2, title_threshold: 1.0, body_threshold: 1.0)
        expect(result.ids.size).to eq 2
        expect(result.ids).to eq [idea_bats.id, idea_burger.id]
      end

      it 'matches on the embedded_attributes' do
        result = service.similar_ideas(embedded_attributes: ['title'], title_threshold: 1.0, body_threshold: 1.0)
        expect(result.ids).to eq [idea_burger.id, idea_moon.id]
      end

      it 'applies the title_threshold' do
        result = service.similar_ideas(title_threshold: 0.6, body_threshold: 1.0)
        expect(result.ids).to eq [idea_bats.id, idea_burger.id]
      end

      it 'applies the body_threshold' do
        EmbeddingsSimilarity.update_all(embedded_attributes: 'body')
        result = service.similar_ideas(title_threshold: 1.0, body_threshold: 0.55)
        expect(result.ids).to eq [idea_burger.id]
      end
    end

    describe do
      let(:idea) do
        title_multiloc = { 'en' => 'Pizza' }
        body_multiloc = {
          'en' => 'Pizza is a <b>yeasted flatbread</b> typically topped with tomato sauce and cheese and baked in an oven.',
          'fr-BE' => '<b>Pizza</b> est un pain plat levé typiquement recouvert de sauce tomate et de fromage et cuit au four.'
        }
        create(:idea, title_multiloc:, body_multiloc:, author: create(:user, locale: 'fr-FR'))
      end

      it 'uses the author locale to resolve the multiloc attributes' do
        expect_any_instance_of(CohereMultilingualEmbeddings)
          .to receive(:embedding).with('<b>Pizza</b> est un pain plat levé typiquement recouvert de sauce tomate et de fromage et cuit au four.').at_least(:once).and_return(embeddings['pizza'])
        service.similar_ideas(body_threshold: 1.0)
      end
    end
  end

  describe 'upsert_embeddings!' do
    it 'creates a new embeddings_similarity if it does not exist' do
      idea.embeddings_similarities.destroy_all
      embedding = embeddings['moon']
      allow_any_instance_of(CohereMultilingualEmbeddings).to receive(:embedding) do
        embedding
      end
      idea # Load idea to start from correct EmbeddingsSimilarity.count
      expect { service.upsert_embeddings! }.to change(EmbeddingsSimilarity, :count).by(2)
      expect(idea.embeddings_similarities.pluck(:embedded_attributes)).to match_array %w[title body]
      expect(idea.embeddings_similarities.pluck(:embedding)).to contain_exactly(embedding, embedding)
    end

    it 'updates the embedding if it already exists' do
      embedding = embeddings['bats']
      allow_any_instance_of(CohereMultilingualEmbeddings).to receive(:embedding) do
        embedding
      end
      idea # Load idea to start from correct EmbeddingsSimilarity.count
      expect { service.upsert_embeddings! }.to change(EmbeddingsSimilarity, :count).by(1)
      expect(idea.embeddings_similarities.pluck(:embedded_attributes)).to match_array %w[title body]
      expect(idea.embeddings_similarities.pluck(:embedding)).to contain_exactly(embedding, embedding)
    end
  end
end
