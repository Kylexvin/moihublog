import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronRight, UserCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Blog.css';

const BlogHomepage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsResponse = await axios.get('http://localhost:5000/api/posts', {
          params: {
            page: currentPage,
            limit: postsPerPage,
            category: currentCategory !== 'All' ? currentCategory : undefined
          }
        });

        const postsWithAuthors = await Promise.all(
          postsResponse.data.posts.map(async (post) => {
            try {
              if (post.author && post.author._id) {
                const authorResponse = await axios.get(`http://localhost:5000/api/users/${post.author._id}`);
                return {
                  ...post,
                  authorName: authorResponse.data.name || 'Unknown Author'
                };
              }
              return {
                ...post,
                authorName: 'Unknown Author'
              };
            } catch (authorError) {
              console.error(`Error fetching author for post ${post._id}:`, authorError);
              return {
                ...post,
                authorName: 'Unknown Author'
              };
            }
          })
        );

        setPosts(postsWithAuthors);
        setLoading(false);
      } catch (err) {
        console.error('Fetch posts error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPosts();
  }, [currentPage, currentCategory]);

  const truncateContent = (content) => {
    if (!content || !Array.isArray(content)) return 'No excerpt available';
    
    const firstParagraph = content.find(item => item.type === 'paragraph');
    return firstParagraph 
      ? (firstParagraph.text.length > 150 
        ? `${firstParagraph.text.slice(0, 150)}...` 
        : firstParagraph.text)
      : 'No excerpt available';
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Assuming the first post is the featured post
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  // Get unique categories from the posts
  const allCategories = ['All', ...new Set(posts.map(post => post.category))];

  return (
    <div className="blog-homepage">
      {featuredPost && (
        <div className="featured-post" style={{backgroundImage: `url(${featuredPost.image})`}}>
          <div className="featured-post-background"></div>
          <div className="featured-post-content">
            <span className="featured-tag">Featured</span>
            <h1 className="featured-title">{featuredPost.title}</h1>
            <p className="featured-excerpt">{truncateContent(featuredPost.content)}</p>
            <div className="featured-meta">
              <div className="meta-item">
                <UserCircle size={16} />
                <span>{featuredPost.authorName}</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
              </div>
            </div>
            <Link to={`/blog/${featuredPost._id}`} className="featured-read-btn">
              Read More
              <ChevronRight className="btn-icon" size={20} />
            </Link>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="category-filter">
        {allCategories.map((category) => (
          <button 
            key={category}
            className={`category-btn ${currentCategory === category ? 'active' : ''}`}
            onClick={() => setCurrentCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="blog-grid">
        {regularPosts.map((post) => (
          <div key={post._id} className="blog-card">
            <img 
              src={post.image} 
              alt={post.title} 
              className="blog-card-image"
            />
            <div className="blog-card-content">
              <span className="blog-card-category">{post.category}</span>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-excerpt">{truncateContent(post.content)}</p>
              <div className="blog-card-footer">
                <div className="blog-card-author">
                  <UserCircle size={16} />
                  <span>{post.authorName}</span>
                </div>
                <Link to={`/blog/${post._id}`} className="blog-card-read-more">
                  Read More
                  <ChevronRight className="read-more-icon" size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button 
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={posts.length < postsPerPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogHomepage;
