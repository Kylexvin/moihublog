import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditPostPage = () => {
  const { id } = useParams(); // To get the post ID from the URL
  const navigate = useNavigate(); // Using useNavigate instead of useHistory
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [contentBlocks, setContentBlocks] = useState([]);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Fetch the post data for editing
    const fetchPost = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No token found! Please log in again.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch post data');
        }

        const data = await response.json();
        const post = data.post;
        
        setTitle(post.title);
        setCategory(post.category);
        setContentBlocks(post.content || []); // Ensure content exists
        setPreviewImage(post.image);
      } catch (error) {
        console.error('Error fetching post for editing:', error);
        alert('Error fetching post data.');
      }
    };

    fetchPost();
  }, [id]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !category.trim()) {
      alert('Title and category are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    if (image) formData.append('image', image);

    // Make sure to update the 'contentBlocks' properly
    formData.append('content', JSON.stringify(contentBlocks)); // Ensure content is properly serialized

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('No token found! Please log in again.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'PATCH', // Change from PUT to PATCH
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Post updated successfully!');
        navigate('/post-list'); // Redirect to the list of posts after a successful update
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Error updating post'}`);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleContentChange = (blockIndex, field, newValue) => {
    const updatedContent = [...contentBlocks];
    updatedContent[blockIndex][field] = newValue;
    setContentBlocks(updatedContent);
  };

  const handleListItemChange = (blockIndex, itemIndex, newItem) => {
    const updatedContent = [...contentBlocks];
    updatedContent[blockIndex].items[itemIndex] = newItem;
    setContentBlocks(updatedContent);
  };

  const handleAddListItem = (blockIndex) => {
    const updatedContent = [...contentBlocks];
    updatedContent[blockIndex].items.push(''); // Add a new empty list item
    setContentBlocks(updatedContent);
  };

  const handleRemoveListItem = (blockIndex, itemIndex) => {
    const updatedContent = [...contentBlocks];
    updatedContent[blockIndex].items.splice(itemIndex, 1); // Remove the list item
    setContentBlocks(updatedContent);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Edit Blog Post</h1>

      <input
        type="text"
        placeholder="Enter blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
      />

      <input
        type="text"
        placeholder="Enter blog category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
      />

      <div>
        <input type="file" onChange={handleImageUpload} />
        {previewImage && (
          <div style={{ marginTop: '10px' }}>
            <p>Preview:</p>
            <img src={previewImage} alt="Uploaded Preview" style={{ width: '200px', borderRadius: '8px' }} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Content Preview:</h2>
        {contentBlocks.map((block, blockIndex) => (
          <div key={blockIndex} style={{ marginBottom: '10px' }}>
            {block.type === 'paragraph' && (
              <div>
                <textarea
                  value={block.text}
                  onChange={(e) => handleContentChange(blockIndex, 'text', e.target.value)}
                  style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                />
              </div>
            )}
            {block.type === 'header' && (
              <div>
                <input
                  type="text"
                  value={block.text}
                  onChange={(e) => handleContentChange(blockIndex, 'text', e.target.value)}
                  style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                />
              </div>
            )}
            {block.type === 'list' && (
              <div>
                <h3>List Items:</h3>
                <ul>
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleListItemChange(blockIndex, itemIndex, e.target.value)}
                        style={{ width: '100%', marginBottom: '5px', padding: '5px' }}
                      />
                      <button
                        onClick={() => handleRemoveListItem(blockIndex, itemIndex)}
                        style={{ marginLeft: '10px' }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleAddListItem(blockIndex)} style={{ marginTop: '10px' }}>
                  Add Item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleUpdate} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Update Blog Post
      </button>
    </div>
  );
};

export default EditPostPage;
