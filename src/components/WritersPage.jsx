import React, { useState, useEffect } from 'react';
import './WritersPage.css';

const WritersPage = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [contentBlocks, setContentBlocks] = useState([]);
  const [newBlock, setNewBlock] = useState({ type: 'paragraph', text: '', items: [] });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch all posts on component mount
    const fetchPosts = async () => {
      const token = localStorage.getItem('authToken'); // Get token from localStorage
      if (!token) {
        alert('No token found! Please log in again.');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/posts', {
          headers: {
            'Authorization': `Bearer ${token}`, // Include token in Authorization header
          },
        });
        const data = await response.json();
        if (data && data.posts) {
          setPosts(data.posts); // Make sure posts exist in the response
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []); // Runs only once when component is mounted

  // Handle adding content blocks
  const addBlock = () => {
    if (newBlock.type === 'list' && newBlock.items.length === 0) {
      alert('Please add at least one item to the list.');
      return;
    }
    if (newBlock.text.trim() || (newBlock.type === 'list' && newBlock.items.length > 0)) {
      setContentBlocks([...contentBlocks, newBlock]);
      setNewBlock({ type: 'paragraph', text: '', items: [] });
    }
  };

  // Handle image upload preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);

      // Preview the uploaded image
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle submitting form
  const handleSubmit = async () => {
    if (!title.trim() || !category.trim()) {
      alert('Title and category are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    if (image) formData.append('image', image);
    formData.append('content', JSON.stringify(contentBlocks));

    const token = localStorage.getItem('authToken');  // Get token from localStorage
    if (!token) {
      alert('No token found! Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`, // Include token in Authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert('Blog post successfully created!');
        setPosts(data.posts); // Update the list of posts
        setTitle('');
        setCategory('');
        setContentBlocks([]);
        setImage(null);
        setPreviewImage(null);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error creating blog post'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Handle delete post
  const handleDelete = async (postId) => {
    const token = localStorage.getItem('authToken');  // Get token from localStorage
    if (!token) {
      alert('No token found! Please log in again.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Include token in Authorization header
        },
      });

      if (response.ok) {
        alert('Post deleted successfully!');
        setPosts(posts.filter((post) => post._id !== postId));
      } else {
        alert('Error deleting post.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <nav>
          <a href="/" style={{ marginRight: '15px' }}>Go Home</a>
          {/* <a href="/my-posts" style={{ marginRight: '15px' }}>All Posts</a>
          <a href="/logout">Log Out</a> */}
        </nav>
      </header>

      <h1>Create Blog Post</h1>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Enter blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
      />

      {/* Category Input */}
      <input
        type="text"
        placeholder="Enter blog category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
      />

      {/* Image Upload */}
      <div>
        <input type="file" onChange={handleImageUpload} />
        {previewImage && (
          <div style={{ marginTop: '10px' }}>
            <p>Preview:</p>
            <img src={previewImage} alt="Uploaded Preview" style={{ width: '200px', borderRadius: '8px' }} />
          </div>
        )}
      </div>

      {/* Content Block Editor */}
      <div style={{ marginTop: '20px' }}>
        <select
          value={newBlock.type}
          onChange={(e) => setNewBlock({ ...newBlock, type: e.target.value })}
          style={{ marginRight: '10px' }}
        >
          <option value="paragraph">Paragraph</option>
          <option value="header">Header</option>
          <option value="list">List</option>
        </select>

        {newBlock.type === 'list' ? (
          <input
            type="text"
            placeholder="Enter list items, separated by commas"
            value={newBlock.items.join(', ')}
            onChange={(e) => setNewBlock({ ...newBlock, items: e.target.value.split(',').map(item => item.trim()) })}
            style={{ width: 'calc(100% - 120px)', marginBottom: '10px', padding: '10px' }}
          />
        ) : (
          <input
            type="text"
            placeholder={`Enter ${newBlock.type}`}
            value={newBlock.text}
            onChange={(e) => setNewBlock({ ...newBlock, text: e.target.value })}
            style={{ width: 'calc(100% - 120px)', marginBottom: '10px', padding: '10px' }}
          />
        )}

        <button onClick={addBlock} style={{ padding: '10px 20px' }}>Add Block</button>
      </div>

      {/* Preview Content Blocks */}
      <div style={{ marginTop: '20px' }}>
        <h2>Preview:</h2>
        {contentBlocks.map((block, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            {block.type === 'paragraph' && <p>{block.text}</p>}
            {block.type === 'header' && <h2>{block.text}</h2>}
            {block.type === 'list' && (
              <ul>
                {block.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button onClick={handleSubmit} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Submit Blog Post
      </button>

      {/* CRUD Section */}
      <div style={{ marginTop: '40px' }}>
        <h2>Your Posts:</h2>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h3>{post.title}</h3>
              <p>Category: {post.category}</p>
              <button onClick={() => handleDelete(post._id)} style={{ marginRight: '10px' }}>Delete</button>
              <a href={`/edit/${post._id}`} style={{ textDecoration: 'none' }}>Edit</a>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default WritersPage;
