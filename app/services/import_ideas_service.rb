class ImportIdeasService

	MAX_IDEAS = 500

	def import_ideas idea_models_data
		added_idea_ids = []
		begin
		  if idea_models_data.size > MAX_IDEAS
			  raise "The maximal amount of #{MAX_IDEAS} ideas has been exceeded"
		  end
		  idea_models_data.each do |idea_data|
		  	added_idea_ids.push convert_idea(idea_data).id
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
    if !idea_data[:title]
      raise "A title for the idea is mandatory!"
    end
  	d[:title_multiloc] = multiloculate idea_data[:title]
    if !idea_data[:body]
      raise "A body for the idea is mandatory!"
    end
  	d[:body_multiloc] = multiloculate idea_data[:body]
  	d[:topics] = idea_data[:topic_titles].map do |topic_title|
  		topic_title = topic_title.downcase
  		Topic.all.select do |topic| 
  			topic.title_multiloc.values
  			  .map{ |v| v.downcase }
  			  .include? topic_title
  		end.first
  	end.select{ |topic| topic }
  	if !idea_data[:project_title]
      raise "A project title is mandatory!"
    end
  	project_title = idea_data[:project_title].downcase
  	d[:project] = Project.all.select do |project|
  	  project.title_multiloc.values
  		  .map{ |v| v.downcase }
  		  .include? project_title
  	end&.first
  	if !d[:project]
  	  raise "No project with title #{idea_data[:project_title]} exists"
  	end
  	if idea_data[:user_email]
  	  d[:author] = User.find_by(email: idea_data[:user_email])
  	  if !d[:author]
  		  raise "No user with email #{idea_data[:user_email]} exists"
  	  end
  	end
  	d[:publication_status] = 'published'
  	idea = Idea.create! d
  	if idea_data[:image_url]
  		begin
  		  IdeaImage.create!(remote_image_url: idea_data[:image_url], idea: idea)
  		rescue Exception => e
  			raise "No image could be downloaded from #{idea_data[:image_url]}, make sure the URL is valid and ends with a file extension such as .png or .jpg"
  		end
  	end
  	if idea_data[:phase_rank]
  		idea_data[:phase_rank] = idea_data[:phase_rank].to_i
  		project_phases = Phase.where(project_id: d[:project].id)
  		if idea_data[:phase_rank] > project_phases.size
  			raise "Only #{idea_data[:phase_rank]} phases exist within project #{idea_data[:project_title]}"
  		end
  		phase = project_phases.order(:start_at).all[idea_data[:phase_rank]-1]
  		if !phase
  			raise "No phase with title #{idea_data[:phase_title]} exists within project #{idea_data[:project_title]}"
  		end
  		IdeasPhase.create!(phase: phase, idea: idea)
  	end
  	idea
  end

  def multiloculate value
  	multiloc = {}
  	Tenant.current.settings.dig('core', 'locales').each do |loc|
  		multiloc[loc] = value
  	end
  	multiloc
  end

end