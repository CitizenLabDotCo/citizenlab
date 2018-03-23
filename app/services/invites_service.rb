require 'rubyXL'

class InvitesService


  def bulk_create_xlsx file, default_params={}, inviter=nil
    hash_array = xlsx_to_hash_array(file)
    invites = build_invites(hash_array, default_params, inviter)
    pre_check_invites(invites)
    save_invites(invites)
  end

  def bulk_create emails, default_params={}, inviter=nil
    hash_array = emails.map{|e| {"email" => e}}
    invites = build_invites(hash_array, default_params, inviter)
    pre_check_invites(invites)
    save_invites(invites)
  end


  private

  def xlsx_to_hash_array file
    XlsxService.new.xlsx_to_hash_array(file).each do |hash|
      if hash['groups']
        hash['group_ids'] = xlsx_groups_to_group_ids(hash['groups'])
        hash.delete('groups')
      end
      if hash['admin'] == true
        hash['roles'] = {"type" => "admin"}
      end
      hash.delete('admin')
    end
  end

  def xlsx_groups_to_group_ids groups
    groups.split(',').map do |group_title|
      stripped_group_title = group_title.strip
      Group.all.find{|g| g.title_multiloc.values.map(&:strip).include? stripped_group_title}&.id
    end.compact
  end

  def build_invites hash_array, default_params={}, inviter=nil
    hash_array.map do |invite_params|
      invite = build_invite(invite_params, default_params, inviter)
    end
  end

  def build_invite params, default_params={}, inviter=nil
    invitee = User.new({
      email: params["email"],
      first_name: params["first_name"], 
      last_name: params["last_name"], 
      locale: params["locale"] || default_params["locale"] || Tenant.settings('core', 'locales').first, 
      group_ids: params["group_ids"] || default_params["group_ids"] || [],
      roles: params["roles"] || default_params["roles"] || [],
      invite_status: 'pending'
    })
    Invite.new(invitee: invitee, inviter: inviter)
  end

  def pre_check_invites invites
    invites.each do |invite|
      invite.validate!
      invite.invitee.validate!
    end
  end

  def save_invites invites
    ActiveRecord::Base.transaction do
      invites.each do |invite|
        invite.save
        invite.invitee.save
      end
    end
  end

end