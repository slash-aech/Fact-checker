function sendQuery() {
  const queryInput = document.getElementById("queryInput").value;
  const imageInput = document.getElementById("imageInput").files[0];

  if (!queryInput && !imageInput) {
      alert("Please enter a query or upload an image.");
      return;
  }

  const formData = new FormData();
  if (queryInput) formData.append("query", queryInput);
  if (imageInput) formData.append("image", imageInput);

  fetch("http://127.0.0.1:8000/chatbot/", {
      method: "POST",
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      if (data.message) {
          document.getElementById("responseBox").innerHTML = `<strong>Error:</strong> ${data.message}`;
      } else {
          document.getElementById("responseBox").innerHTML = `
              <strong>Revised Query:</strong> ${data["revised query"]}<br>
              <strong>Response:</strong> ${data["response"]}<br>
              <ul>
                  ${data.urls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join("")}
              </ul>
          `;
      }
  })
  .catch(error => {
      document.getElementById("responseBox").innerHTML = "Error fetching response.";
      console.error("Error:", error);
  });
}