class SessionsController < ApplicationController
  def new
    @title = "Log in"
  end

  def create
    user = User.authenticate(params[:name], params[:password])
    if user
      user.logins += 1
      user.save
      
      user_session.user_id = user.id

      if params[:timezone] != ''
        user_session.timezone = ActiveSupport::JSON.decode(params[:timezone])
      else
        user_session.timezone = nil
      end
      
	  if auto_logout && @current_user
	      user_session.touch
	  end
	  
      redirect_to '/users/' + user.id.to_s, :notice => "Logged in!"
    else
      flash.now.alert = "Invalid name or password"
      render "new"
    end
  end

  def destroy
    user_session.destroy
    redirect_to root_url, :notice => "Logged out!"
  end

  def logout_and_delete_user
    id = params[:did]
	u = User.find id
	
	if !u
	    redirect_to root_url, :notice => 'user not found'
	end
    
    if current_user && current_user.id.to_s == id
		note = 'logged out and deleted user "' + u.name + '"'
	    #session[:user_id] = nil
	    user_session.user_id = nil
	else
		note = 'deleted user "' + u.name + '"'
	end
	
	u.destroy
	
    redirect_to root_url, :notice => note
  end
end
