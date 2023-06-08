# frozen_string_literal: true

FactoryBot.define do
  factory :internal_comment do
    author
    association :post, factory: :idea
    parent { nil }
    publication_status { 'published' }
    body_text { '<p>I think this is a very good idea!</p>' }

    factory :internal_comment_with_mentions do
      transient do
        mentioned_users { create_list(:user, 2) }
      end
      after(:create) do |internal_comment, evaluator|
        service = MentionService.new
        mentions = evaluator.mentioned_users.map do |u|
          service.add_span_around service.user_to_mention(u), u
        end
        internal_comment.update(body_text: "#{mentions.join ', '} are sitting in a tree")
      end
    end
  end

  factory :nested_internal_comment do
    author
    association :post, factory: :idea
    association :parent, factory: :internal_comment
    publication_status { 'published' }
    body_text { '<p>After some more thinking, there are some issues actually ...!</p>' }
  end
end
