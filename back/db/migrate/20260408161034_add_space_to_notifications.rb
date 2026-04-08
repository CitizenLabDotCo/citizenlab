class AddSpaceToNotifications < ActiveRecord::Migration[7.2]
  def change
    safety_assured do                                                                                                                                                                                        
      add_reference :notifications, :space, type: :uuid, foreign_key: true, index: true                                                                                                                      
    end
  end
end
