class PagesController < ApplicationController
  def home
    @title = "Home"
  end

  def contact
    @title = "Contact"
  end

  def get_current_user
    respond_to do |format|  
      format.json {
        if current_user
          render :json => {name: current_user.name, age: 12}
        else
          render :json => nil
        end
      }
    end  
  end


  def post_score
    score = 2*params[:score]
    user = current_user.name if current_user
    render :json => {'processed' => score, user: user}
  end

  def post_score_1 # return in params
    render :json => params
    #render :json => {"Para" => params, "aha" => 7}
=begin
    respond_to do |format|
      format.html {
        render :json => {"Para" => params, "aha" => 17}
      }
      format.json {
        if current_user
          render :json => {"para" => params, "aha" => 17}
          #render :json => {name: current_user.name, age: 12}
        else
          render :json => {name: 'QBert'}
        end
      }
    end

    "anything?"
=end
  end

  def about
    @title = "About"
    # render :layout => false   # application.html (.erb) will NOT be used
  end

  def news
    @title = "News"
  end

  def help
    @title = "Help"
  end

  def comments
    @title = "Comments"
  end

  def invaders
    @title = "Playing Space Invaders"
  end
end
