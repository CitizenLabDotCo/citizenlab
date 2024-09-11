class IdeasChannel < ApplicationCable::Channel
  def subscribed
    Apartment::Tenant.switch! 'localhost'
    idea = Idea.find(params[:id])
    stream_for idea

    # stream_from "ideas_#{idea.id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
