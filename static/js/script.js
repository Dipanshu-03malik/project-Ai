// Get elements
const openDocumentChatButton = document.getElementById('openDocumentChat');
const documentChatForm = document.getElementById('documentChatForm');
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const pdfContent = document.getElementById('pdfContent');
const chatBox = document.getElementById('chatBox');

// Toggle the document chat form when clicked
openDocumentChatButton.addEventListener('click', () => {
    documentChatForm.style.display = documentChatForm.style.display === 'block' ? 'none' : 'block';
});

// Close the document chat form when clicking outside of it
document.addEventListener('click', (event) => {
    if (documentChatForm.style.display === 'block' && !documentChatForm.contains(event.target) && !openDocumentChatButton.contains(event.target)) {
        documentChatForm.style.display = 'none';
    }
});

// Prevent default behavior for drag-and-drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
});

// Handle file drop
dropArea.addEventListener('drop', handleFileDrop, false);
dropArea.addEventListener('click', () => fileInput.click(), false);
fileInput.addEventListener('change', handleFileSelect, false);

// Handle file drop or select
function handleFileDrop(e) {
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    handleFileUpload(file);
}

// Handle file upload and communication with backend
function handleFileUpload(file) {
    if (!file) return;

    const fileType = file.type;
    const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
    ];

    if (!supportedTypes.includes(fileType)) {
        alert('Unsupported file type. Please upload a PDF, DOC, PPT, or TXT file.');
        return;
    }

    // Create FormData to send file to the backend
    const formData = new FormData();
    formData.append('file', file);

    // Send file to backend
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showFileSelectedMessage(`${file.name} uploaded successfully. You can now ask questions.`);
            startChatWithAI(data.content);
        } else {
            showFileSelectedMessage('Error uploading file.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showFileSelectedMessage('Error uploading file.');
    });
}

// Show file selected message
function showFileSelectedMessage(message) {
    pdfContent.innerHTML = `<p>${message}</p>`;
}

// Function to start asking questions to AI after file is uploaded
function startChatWithAI(fileContent) {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    // Handle asking a question to the AI
    sendButton.addEventListener('click', () => {
        const question = chatInput.value.trim();
        if (!question) return;

        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: fileContent,
                question: question
            }),
        })
        .then(response => response.json())
        .then(data => {
            const aiResponse = document.createElement('p');
            aiResponse.textContent = `AI: ${data.answer}`;
            chatBox.appendChild(aiResponse);
            chatInput.value = '';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error asking the question.');
        });
    });
}
