class ArticlesController < ApplicationController

  helper_method :sort_column, :sort_direction


  def new
    @article = Article.new
  end

  def create
    @article = Article.new(params[:article])
    if @article.save
      flash[:article_id] = @article.id
      # redirect_to new_article_url, :notice => "created Article"
      redirect_to '/articles/' + @article.id.to_s, :notice => "created Article"
    else
      render :action => "new"
    end
  end

  def show
    @article = Article.find(params[:id])
    respond_to do |format|
      format.html
      format.json {
        render :json => @article, :status => :ok
      }
    end
  end

  def edit
    @article = Article.find(params[:id])
  end

  def update
    @article = Article.find(params[:id])
    @article.update_attributes(params[:article])
    if @article.save
      redirect_to '/articles/' + @article.id.to_s, :notice => "Updated article! content: " + @article.content
    else
      render "edit"
    end
  end

  def update_ok
    @article = Article.find(params[:id])
    @article.update_attributes(params[:article])
    if @article.save
      redirect_to '/articles/' + @article.id.to_s, :notice => "Updated article!"
    else
      render "edit"
    end
  end

  def index
    @title = "All Articles"
    @articles = Article.scoped.order(sort_column + ' ' + sort_direction).page(params[:page]).per(15)
    # @articles = Article.scoped;
    respond_to do |format|
      format.html
      #format.json { render :json => @articles, :status => :ok }
      format.json {
        render :json => articles_id_and_title, :status => :ok
      }
    end
  end

  def articles_id_and_title
    theList = Array.new

    @articles.each { |article|
      # theList << article.id
      theList << { id: article.id, title: article.title }
    }

    theList
  end


  def destroy
    @article = Article.find(params[:id])

    #test if article exist
    # @article.testing

    @article.destroy

    redirect_to(articles_url)
    #respond_to do |format|
    #  format.html  { redirect_to(users_url) }
    #  format.json  { render :json => {}, :status => :ok }
    #end
  end



  private
  def sort_column
    ['title', 'article.created_at', 'article.id'].include?(params[:sort]) ? params[:sort] : "title"
  end

  def sort_direction
    %w[asc desc].include?(params[:direction]) ? params[:direction] : "desc"
  end

end
