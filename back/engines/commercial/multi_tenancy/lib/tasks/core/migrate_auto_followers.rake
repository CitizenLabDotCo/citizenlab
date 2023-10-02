# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Migrate followers, automatically generated from the participants'
  task remove_reacted_auto_followers: [:environment] do |_t, _args|
    Tenant.creation_finalized.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        Idea.all.each do |idea|
          remove_reacted_post_followers idea
        end
        Initiative.all.each do |initiative|
          remove_reacted_post_followers initiative
        end
      rescue StandardError => e
        puts "An error occurred: #{e.message}"
      end
    end
  end

  desc 'Migrate followers, automatically generated from the participants'
  task migrate_auto_followers: [:environment] do |_t, _args|
    Tenant.creation_finalized.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        migrate_project_followers!
        migrate_idea_followers!
        migrate_initiative_followers!
        migrate_folder_followers!
        migrate_area_followers!
      rescue StandardError => e
        puts "An error occurred: #{e.message}"
      end
    end
  end

  def migrate_project_followers!
    Project.all.each do |project|
      participants_service.project_participants(project).each do |participant|
        Follower.find_or_create_by(followable: project, user: participant)
      end
    end
  end

  def migrate_idea_followers!
    Idea.all.each do |idea|
      participants_service.ideas_participants(Idea.where(id: idea)).each do |participant|
        Follower.find_or_create_by(followable: idea, user: participant)
      end
    end
  end

  def migrate_initiative_followers!
    Initiative.all.each do |initiative|
      participants_service.initiatives_participants(Initiative.where(id: initiative)).each do |participant|
        Follower.find_or_create_by(followable: initiative, user: participant)
      end
    end
    CosponsorsInitiative.includes(:initiative, :user).where(status: 'accepted').each do |cosponsor|
      Follower.find_or_create_by(followable: cosponsor.initiative, user: cosponsor.user)
    end
  end

  def migrate_folder_followers!
    ProjectFolders::Folder.all.each do |folder|
      participants_service.projects_participants(folder.projects).each do |participant|
        Follower.find_or_create_by(followable: folder, user: participant)
      end
    end
  end

  def migrate_area_followers!
    User.where("custom_field_values->>'domicile' IS NOT NULL AND custom_field_values->>'domicile' != 'outside'").each do |user|
      area = Area.where(id: user.domicile).first
      Follower.find_or_create_by(followable: area, user: user) if area
    end
  end

  def remove_reacted_post_followers(post)
    keep_users = [post.author_id].compact
    keep_users += Comment.where(post: post).pluck(:author_id)
    Follower.where(followable: post).where.not(user_id: keep_users).delete_all
  end

  def participants_service
    @participants_service ||= ParticipantsService.new
  end
end
