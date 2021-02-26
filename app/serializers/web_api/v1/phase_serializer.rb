class WebApi::V1::PhaseSerializer < WebApi::V1::BaseSerializer
  include WebApi::V1::ParticipationContextSerializer

  attributes :title_multiloc, :start_at, :end_at, :created_at, :updated_at, :ideas_count

  attribute :description_multiloc do |object|
    TextImageService.new.render_data_images object, :description_multiloc
  end

  belongs_to :project

  has_many :permissions

  has_one :user_basket, if: Proc.new { |object, params|
    signed_in? object, params
  } do |object, params|
    user_basket object, params
  end

  def self.user_basket object, params
    preloaded_user_basket = params.dig(:user_baskets, object.id)&.first
    if preloaded_user_basket
      preloaded_user_basket
    else
      current_user(params)&.baskets&.select{ |basket|
        (basket.participation_context_id == object.id) && (basket.participation_context_type == 'Phase')
      }&.first
    end
  end
end
