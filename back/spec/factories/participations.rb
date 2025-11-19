FactoryBot.define do
  # Generic participation factory (no votes)
  factory :participation, class: Hash do
    skip_create

    transient do
      user { nil }
    end

    initialize_with do
      participation_user = user || create(:user)
      {
        id: SecureRandom.uuid,
        action: 'generic',
        acted_at: Time.current,
        classname: 'Generic',
        user_id: participation_user.id,
        user_custom_field_values: participation_user.custom_field_values
      }
    end
  end

  # Basket-specific participation
  factory :basket_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      basket = create(:basket, user: participation_user)
      {
        id: basket.id,
        action: 'voting',
        acted_at: basket.submitted_at,
        classname: 'Basket',
        user_id: basket.user_id,
        user_custom_field_values: basket.user.custom_field_values,
        votes: basket.baskets_ideas.sum(:votes)
      }
    end

    trait :with_votes do
      transient do
        vote_count { 5 }
      end

      initialize_with do
        participation_user = user || create(:user)  # ← Added this line
        basket = create(:basket, user: participation_user)  # ← Use participation_user
        create(:baskets_idea, basket: basket, votes: vote_count)
        {
          id: basket.id,
          action: 'voting',
          acted_at: basket.submitted_at,
          classname: 'Basket',
          user_id: basket.user_id,
          user_custom_field_values: basket.user.custom_field_values,
          votes: vote_count
        }
      end
    end
  end

  # Comment participation
  factory :comment_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)  # ← Added this line
      comment = create(:comment, author: participation_user)  # ← Use participation_user
      {
        id: comment.id,
        action: 'commenting_idea',
        acted_at: comment.created_at,
        classname: 'Comment',
        user_id: comment.author_id,
        user_custom_field_values: comment.author.custom_field_values
      }
    end
  end

  # Alias basket_participation as the default participation
  factory :participation_default, parent: :basket_participation
end
