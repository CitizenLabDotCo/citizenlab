# frozen_string_literal: true

class WebApi::V1::ProjectReviewsController < ApplicationController
  def show
    if review
      authorize(review)
      render json: serialize(review)
    else
      authorize(project, :update?)
      head(:no_content)
    end
  end

  def create
    review = ProjectReview.new(
      project_id: params[:project_id],
      requester: current_user,
      reviewer_id: params[:project_review][:reviewer_id]
    )

    authorize(review)

    side_fx.before_create(review, current_user)
    if review.save
      side_fx.after_create(review, current_user)
      render json: serialize(review), status: :created
    else
      render json: { errors: review.errors }, status: :unprocessable_entity
    end
  end

  def update
    if review
      if params[:project_review][:state] == 'approved' && !review.approved?
        review.approve(current_user)
        authorize(review)
        unless review.valid?
          render json: { errors: review.errors }, status: :unprocessable_entity
          return
        end

        side_fx.before_update(review, current_user)
        review.save!
        side_fx.after_update(review, current_user)
      end

      render json: serialize(review)
    else
      authorize(project, :update?)
      head(:not_found)
    end
  end

  def destroy
    if review
      authorize(review)
      side_fx.before_destroy(review, current_user)
      review.destroy!
      side_fx.after_destroy(review, current_user)

      head :no_content
    else
      authorize(project, :update?)
      head :not_found
    end
  end

  private

  def review
    @review ||= begin
      find_args = {
        project_id: params[:project_id],
        id: params[:id]
      }.compact

      ProjectReview.find_by!(find_args)
    rescue ActiveRecord::RecordNotFound
      nil
    end
  end

  def project
    @project ||= review&.project || Project.find(params[:project_id])
  end

  def serialize(review)
    WebApi::V1::ProjectReviewSerializer.new(review, params: jsonapi_serializer_params).serializable_hash
  end

  def side_fx
    @side_fx ||= SideFxProjectReviewService.new
  end
end
