class WebApi::V1::PhaseSerializer < ActiveModel::Serializer
  include WebApi::V1::ParticipationContextSerializer

  attributes :id, :title_multiloc, :description_multiloc, :start_at, :end_at, :created_at, :updated_at
  
  belongs_to :project

  has_many :permissions
  
  has_one :user_basket


  def user_basket
    current_user&.baskets&.find_by participation_context_id: object.id
  end

  # checked by included ParticipationContextSerializer
  def is_participation_context?
    true
  end

end
