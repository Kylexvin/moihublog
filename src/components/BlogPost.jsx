import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, User, ArrowLeft } from 'lucide-react';
import './BlogPost.css';

const BlogPost = () => {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
        
        // Log the full response to understand its structure
        console.log('Full Post Response:', response.data);

        // Set post and related posts from the response
        setPost(response.data.post);
        setRelatedPosts(response.data.relatedPosts || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Render content based on type
  const renderContent = (contentArray) => {
    if (!Array.isArray(contentArray)) return null;

    return contentArray.map((item, index) => {
      switch (item.type) {
        case 'header':
          return <h2 key={index} className="blog-section-header">{item.text}</h2>;
        case 'paragraph':
          return <p key={index} className="blog-paragraph">{item.text}</p>;
        case 'image':
          return (
            <div key={index} className="blog-image-container">
              <img 
                src={item.src} 
                alt={item.caption || 'Blog post image'} 
                className="blog-content-image"
              />
              {item.caption && <p className="image-caption">{item.caption}</p>}
            </div>
          );
        case 'list':
          return (
            <ul key={index} className="blog-list">
              {item.items.map((listItem, liIndex) => (
                <li key={liIndex}>{listItem}</li>
              ))}
            </ul>
          );
        default:
          return null;
      }
    });
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <div className="not-found">Post not found</div>;

  return (
    <div className="blog-post-page">
      <div className="blog-post-header">
        <Link to="/" className="back-to-blog">
          <ArrowLeft size={24} />
          Back to Blog
        </Link>
        <h1 className="blog-post-title">{post.title}</h1>
        
        <div className="blog-post-meta">
          <div className="meta-item">
            <User size={16} />
            <span>{post.author}</span>
          </div>
          <div className="meta-item">
            <Calendar size={16} />
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <Tag size={16} />
            <span>{post.category}</span>
          </div>
          <div className="meta-item">
            <Clock size={16} />
            <span>{post.readTime}</span>
          </div>
        </div>

        <div className="blog-post-featured-image">
          <img 
            src={post.image} 
            alt={post.title} 
            className="featured-image"
          />
        </div>
      </div>

      <div className="blog-post-content">
        {renderContent(post.content)}
      </div>

      {relatedPosts.length > 0 && (
        <div className="related-posts-section">
          <h3>Related Posts</h3>
          <div className="related-posts-grid">
            {relatedPosts.map((relatedPost) => (
              <Link 
                to={`/blog/${relatedPost._id}`} 
                key={relatedPost._id} 
                className="related-post-card"
              >
                <img 
                  src={relatedPost.image} 
                  alt={relatedPost.title} 
                  className="related-post-image"
                />
                <div className="related-post-info">
                  <h4>{relatedPost.title}</h4>
                  <p>{relatedPost.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;