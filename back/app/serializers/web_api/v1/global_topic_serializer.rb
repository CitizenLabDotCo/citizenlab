# frozen_string_literal: true

class WebApi::V1::GlobalTopicSerializer < WebApi::V1::BaseSerializer
  attributes :title_multiloc, :description_multiloc, :ordering, :icon, :static_page_ids, :followers_count, :include_in_onboarding, :is_default
  has_many :static_pages, if: proc { |_record, params| params && params[:include_static_pages] }

  has_one :user_follower, record_type: :follower, if: proc { |object, params|
    signed_in? object, params
  } do |object, params|
    user_follower object, params
  end

  def self.user_follower(object, params)
    if params[:user_followers]
      params.dig(:user_followers, [object.id, 'GlobalTopic'])&.first
    else
      current_user(params)&.follows&.find do |follow|
        follow.followable_id == object.id && follow.followable_type == 'GlobalTopic'
      end
    end
  end
end
