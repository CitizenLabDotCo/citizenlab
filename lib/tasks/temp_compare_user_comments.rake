
namespace :temp do
  desc "Prrrt"
  task :compare_user_comments => :environment do
    rows = []
    Apartment::Tenant.switch('localhost') do
      50.times do |i|
        Idea.count.times do
          idea = create_idea
          create_comment_tree idea, nil
        end
        Initiative.count.times do
          initiative = create_initiative
          create_comment_tree initiative, nil
        end
        author = User.all.map{|u| [u, u.comments.count]}.sort_by(&:last).reverse.map(&:first).first
        params = {
          user_id: author.id,
          page: {
            number: 1,
            size: 10
          }
        }
        start_s1 = Time.now
        TempUserCommentsService.new.in_ruby_solution author, params
        finish_s1 = Time.now
        start_s2 = Time.now
        TempUserCommentsService.new.union_view_solution author, params
        finish_s2 = Time.now

        rows += [{
          iteration: i,
          comment_count: Comment.count,
          user_comment_count: author.comments.count,
          posts_count: (Idea.count + Initiative.count),
          in_ruby_solution: (finish_s1 - start_s1),
          union_view_solution: (finish_s2 - start_s2)
        }]

        CSV.open('comparison_user_comments.csv', "wb") do |csv|
          csv << rows.first.keys
          rows.each do |d|
            csv << d.values
          end
        end
      end
    end
  end

  def create_idea
    created_at = Faker::Date.between(Tenant.current.created_at, Time.now)
    project = Project.offset(rand(Project.count)).first
    phases = []
    if project && project.timeline?
      phases = project.phases.sample(rand(project.phases.count)).select do |phase| 
        phase.ideation? || phase.budgeting?
      end
    end
    Idea.create!({
      title_multiloc: create_for_some_locales{Faker::Lorem.sentence[0...80]},
      body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
      idea_status: IdeaStatus.offset(rand(IdeaStatus.count)).first,
      topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
      areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
      author: User.offset(rand(User.count)).first,
      project: project,
      phases: phases,
      publication_status: 'published',
      published_at: Faker::Date.between(created_at, Time.now),
      created_at: created_at,
      budget: rand(3) == 0 ? nil : (rand(10 ** (rand(3) + 2)) + 50).round(-1),
      assignee: rand(5) == 0 ? User.admin.or(User.project_moderator(project.id)).shuffle.first : nil
    })
  end

  def create_initiative
    created_at = Faker::Date.between(Tenant.current.created_at, Time.now)
      initiative = Initiative.create!({
      title_multiloc: create_for_some_locales{Faker::Lorem.sentence[0...80]},
      body_multiloc: create_for_some_locales{Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join},
      author: User.offset(rand(User.count)).first,
      publication_status: 'published',
      published_at: Faker::Date.between(created_at, Time.now),
      created_at: created_at,
      topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
      areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
      assignee: rand(5) == 0 ? User.admin.shuffle.first : nil,
      # TODO make initiative statuses correspond with required votes reached
      initiative_status: InitiativeStatus.offset(rand(InitiativeStatus.count)).first  
    })
  end

  def create_for_some_locales
    translations = {}
    show_en = (rand(6) == 0)
    translations["en"] = yield if show_en
    translations["nl-BE"] = yield if rand(6) == 0 || !show_en
    translations
  end

  def create_comment_tree(post, parent, depth=0)
    amount = rand(5/(depth+1))
    amount.times do |i|
      c = Comment.create!({
        body_multiloc: {
          "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
          "nl-BE" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
        },
        author: User.normal_user.offset(rand(User.normal_user.count)).first,
        post: post,
        parent: parent,
        created_at: Faker::Date.between((parent ? parent.created_at : post.published_at), Time.now)
      })
      User.all.each do |u|
        if rand(5) < 2
          Vote.create!(votable: c, user: u, mode: "up", created_at: Faker::Date.between(c.created_at, Time.now))
        end
      end
      create_comment_tree(post, c, depth+1)
    end
  end
end
