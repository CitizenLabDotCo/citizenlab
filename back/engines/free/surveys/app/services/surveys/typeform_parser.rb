# Helpers for handling typeform API responses
module Surveys::TypeformParser

  def extract_value_from_answer answer
    case answer[:type]
      when 'text' 
        answer[:text]
      when 'choice' 
        answer[:choice][:label]
      when 'choices' 
        answer[:choices][:labels]
      when 'email' 
        answer[:email]
      when 'url' 
        answer[:url]
      when 'file_url' 
        answer[:file_url]
      when 'boolean' 
        answer[:boolean]
      when 'number' 
        answer[:number]
      when 'date' 
        answer[:date]
      when 'payment' 
        answer[:payment] 
      when 'phone_number' 
        answer[:phone_number] 
      else
        raise "Unsupported typeform answer type #{answer[:type]}"
      end
  end

end