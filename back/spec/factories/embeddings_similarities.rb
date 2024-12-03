FactoryBot.define do
  factory :embeddings_similarity do
    association :embeddable, factory: :idea
    embedding { Array.new(1024) { rand(-1.0..1.0) } }
  end
end