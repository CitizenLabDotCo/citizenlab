# frozen_string_literal: true

class ImpactTracking::SessionHashService
  def generate_for_user(user_id)
    hash([salt, user_id].join)
  end

  def generate_for_visitor(ip, user_agent)
    hash([salt, ip, user_agent].join)
  end

  private

  def hash(str)
    Digest::SHA256.hexdigest(str)
  end

  def salt
    slt = ImpactTracking::Salt.current_salt
    if slt.created_at.month == Time.now.month
      slt.salt
    else
      ImpactTracking::Salt.rotate!.salt
    end
  end
end
