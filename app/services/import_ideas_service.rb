class ImportIdeasService

	MAX_IDEAS = 500

	def import_ideas idea_models_data
		added_idea_ids = []
		begin
		  if idea_models_data.size > MAX_IDEAS
			  raise "The maximal amount of #{MAX_IDEAS} ideas has been exceeded"
		  end
		  idea_models_data.each do |idea_data|
		  	added_idea_ids.push Idea.create(convert_idea(idea_data)).id
		  	puts "Created #{added_idea_ids.first}"
		  end
		  # raise "Aborting anyways" ### debugging purposes
		rescue Exception => e
			added_idea_ids.select{ |id| id }.each do |id|
				Idea.find(id)&.destroy!
				puts "Destroyed #{id}"
	    end
	    raise e
		end
	end


	private

	def convert_idea idea_data
  	d = {}
  	d[:title_multiloc] = multiloculate idea_data[:title]
  	d[:body_multiloc] = multiloculate idea_data[:body]
  	d[:topics] = idea_data[:topic_titles].map do |topic_title|
  		topic_title = topic_title.downcase
  		Topic.all.select do |topic| 
  			topic.title_multiloc.values
  			  .map{ |v| v.downcase }
  			  .include? topic_title
  		end.first
  	end.select{ |topic| topic }
  	# d[:project] = idea_data[:project_title]
  	if idea_data[:user_email]
  	  d[:author] = User.find_by(email: idea_data[:user_email])
  	  if !d[:author]
  		  raise "No user with email #{sv_idea[:user_email]} exists"
  	  end
  	end
  	d[:publication_status] = 'published'
  	# puts d ### debugging purposes
  	d
  end

  def multiloculate value
  	multiloc = {}
  	Tenant.current.settings.dig('core', 'locales').each do |loc|
  		multiloc[loc] = value
  	end
  	multiloc
  end

end