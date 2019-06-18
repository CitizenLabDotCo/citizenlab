class WebApi::V1::PhaseSerializer < ActiveModel::Serializer
  include WebApi::V1::ParticipationContextSerializer

  attributes :id, :title_multiloc, :description_multiloc, :start_at, :end_at, :created_at, :updated_at
  
  belongs_to :project

  has_many :permissions
  
  has_one :user_basket


  def user_basket
    # The line below is a bit slower and causes more
    # queries to be executed by projects#index.
    # current_user&.baskets&.find_by participation_context_id: object.id
    current_user&.baskets&.select do |basket| 
      (basket.participation_context_id == object.id) && (basket.participation_context_type == 'Phase')
    end&.first
  end

  # checked by included ParticipationContextSerializer
  def is_participation_context?
    true
  end

end
