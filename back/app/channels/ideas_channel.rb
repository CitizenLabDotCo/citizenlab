class IdeasChannel < ApplicationCable::Channel
  def subscribed
    idea = Idea.find(params[:id])
    stream_for idea
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
