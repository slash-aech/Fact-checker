import React, { useState } from 'react';

function Form() {
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [input, setInput] = useState(''); // Stores user input text
  const [image, setImage] = useState(null); // Stores uploaded image

  // Helper to safely render a value that might be an object.
  const renderValue = (value) =>
    typeof value === 'object' && value !== null ? JSON.stringify(value) : value;

  // Handles sending text & image to API
  const handleSend = async () => {
    // Store current input values in local variables
    const currentInput = input;
    const currentImage = image;

    if (!currentInput.trim() && !currentImage) {
      alert("Please enter a message or upload an image.");
      return;
    }

    // Create the user message
    const userMessage = {
      text: currentInput || null,
      image: currentImage ? URL.createObjectURL(currentImage) : null,
      sender: 'user',
    };

    // Add the user message to chat and then clear the input fields
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImage(null);

    // Immediately add a loading indicator from the bot
    const loadingMessage = { sender: 'bot', text: 'Loading...' };
    setMessages((prev) => [...prev, loadingMessage]);

    // Prepare form data for the API call
    const formData = new FormData();
    if (currentInput.trim()) formData.append("query", currentInput);
    if (currentImage) formData.append("image", currentImage);

    try {
      const response = await fetch("http://127.0.0.1:8000/chatbot/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Remove the loading message and then add the bot's response
      setMessages((prev) => {
        // Remove any message with text "Loading..."
        const newMessages = prev.filter((m) => m.text !== 'Loading...');

        if (data.message) {
          // If the backend returns an error message (ensure it's a string)
          const errorText = `Error: ${renderValue(data.message)}`;
          newMessages.push({ sender: 'bot', text: errorText });
        } else {
          // Otherwise, push a message containing the revised query, response, and URLs
          newMessages.push({
            sender: 'bot',
            revised: data["revised query"],
            response: data["response"],
            urls: data.urls, // expects an array of URLs
          });
        }
        return newMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the loading message and add an error message if the fetch fails
      setMessages((prev) => {
        const newMessages = prev.filter((m) => m.text !== 'Loading...');
        newMessages.push({ sender: 'bot', text: 'Error fetching response.' });
        return newMessages;
      });
    }
  };

  return (
    <>
      <h1 className='flex justify-center text-4xl font-bold py-5 bg-gray-700 text-orange-600'>
        Fact Checker
      </h1>

      <div className="flex flex-col items-center min-h-screen bg-gray-800 text-white">
        <div className="w-full max-w-3xl flex flex-col flex-grow h-full">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-md shadow-md">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* If the bot message contains revised query info, display the combined message */}
                {message.revised ? (
                  <div className={`inline-block p-2 rounded-md ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}>
                    <p>
                      <strong>Revised Query:</strong> {renderValue(message.revised)}
                    </p>
                    <p>
                      <strong>Response:</strong> {renderValue(message.response)}
                    </p>
                    {Array.isArray(message.urls) && message.urls.length > 0 && (
                      <ul className="mt-2">
                        {message.urls.map((url, idx) => (
                          <li key={idx}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  // Otherwise, display normal text and/or image messages
                  <>
                    {message.text && (
                      <p className={`inline-block p-2 rounded-md ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`}>
                        {renderValue(message.text)}
                      </p>
                    )}

                    {message.image && (
                      <div className="mt-2">
                        <img 
                          src={message.image} 
                          alt="Uploaded" 
                          className="max-w-xs rounded-lg shadow-md blur-sm hover:blur-none transition duration-300"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Input & Upload Section */}
          <div className="flex items-center gap-4 bg-gray-800 p-4 sticky bottom-0">
            {/* Text Input */}
            <textarea
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-900 text-white p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
            ></textarea>

            {/* File Upload Section */}
            <div className="flex flex-col items-center">
              <label className="cursor-pointer bg-gray-700 px-4 py-2 rounded-md shadow-md hover:bg-gray-600">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>

              {/* Upload Indicator */}
              {image && (
                <div className="mt-2 text-sm text-gray-300">
                  <span>{image.name}</span>
                  <button
                    className="ml-2 text-red-500 hover:underline"
                    onClick={() => setImage(null)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Form;
