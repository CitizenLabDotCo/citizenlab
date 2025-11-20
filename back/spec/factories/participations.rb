FactoryBot.define do
  # Generic participation factory (no votes)
  factory :participation, class: Hash do
    skip_create

    transient do
      acted_at { Time.current }
      user { nil }
      user_custom_field_values { {} }
    end

    initialize_with do
      acted_at_time = acted_at || Time.current
      participation_user = user || create(:user)
      custom_field_values = user_custom_field_values.presence || participation_user.custom_field_values

      {
        id: SecureRandom.uuid,
        action: 'generic',
        acted_at: acted_at_time,
        classname: 'Generic',
        user_id: participation_user.id,
        user_custom_field_values: custom_field_values
      }
    end
  end

  # Basket-specific participation
  factory :basket_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      basket = create(:basket, user: participation_user)
      acted_at_time = acted_at || basket.created_at
      custom_field_values = user_custom_field_values.presence || basket.user.custom_field_values

      {
        id: basket.id,
        action: 'voting',
        acted_at: acted_at_time,
        classname: 'Basket',
        user_id: basket.user_id,
        user_custom_field_values: custom_field_values,
        votes: basket.baskets_ideas.sum(:votes)
      }
    end

    trait :with_votes do
      transient do
        vote_count { 5 }
      end

      initialize_with do
        participation_user = user || create(:user)
        basket = create(:basket, user: participation_user)
        acted_at_time = acted_at || basket.created_at
        create(:baskets_idea, basket: basket, votes: vote_count)
        custom_field_values = user_custom_field_values.presence || basket.user.custom_field_values

        {
          id: basket.id,
          action: 'voting',
          acted_at: acted_at_time,
          classname: 'Basket',
          user_id: basket.user_id,
          user_custom_field_values: custom_field_values,
          votes: vote_count
        }
      end
    end
  end

  # Comment participation
  factory :comment_participation, parent: :participation do
    initialize_with do
      participation_user = user || create(:user)
      comment = create(:comment, author: participation_user)
      custom_field_values = user_custom_field_values.presence || comment.author.custom_field_values

      {
        id: comment.id,
        action: 'commenting_idea',
        acted_at: comment.created_at,
        classname: 'Comment',
        user_id: comment.author_id,
        user_custom_field_values: custom_field_values
      }
    end
  end

  # Alias basket_participation as the default participation
  factory :participation_default, parent: :basket_participation
end
