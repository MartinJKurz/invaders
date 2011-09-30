class UserSession
  def initialize(session)
    @session = session
    touch
  end

  def touch
    @session[:last_seen] = Time.now
  end

  def expired?
    Time.now - @session[:last_seen] > 3.hours
  end

  def user
    if !@session[:user_id]
      nil
    else
      User.find(@session[:user_id])
    end
  end

  def user_id=(id)
    @session[:user_id] = id
  end

  def user_id
    # @session[:user_id] if @session[:user_id] else nil
    @session[:user_id]
  end

  def session
    @session
  end
  
  def destroy
	#??
	@session.destroy
	#??
    @session[:user_id] = nil
  end
end

