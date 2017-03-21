class Api::V1::TopicsController < ApplicationController
   before_action :set_topic, only: [:show, :update, :destroy]

   def index
     @topics = policy_scope(Topic).page(params[:page])
     render json: @topics
   end

   def show
     render json: @topic
   end

   private

   def set_topic
     @topic = Topic.find(params[:id])
     authorize @topic
   end

   def secure_controller?
     false
   end
end
