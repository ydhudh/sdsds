document.addEventListener('DOMContentLoaded', function() {
    const startChatBtn = document.getElementById('startChat');
    const sendMessageBtn = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');
    
    let messageHistory = [];
    let isProcessing = false;

    // 调用 AI API
    async function callAI() {
        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messageHistory
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }
            
            if (data.error) {
                throw new Error(data.error);
            }

            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API 调用错误:', error);
            throw new Error('API 调用失败: ' + error.message);
        }
    }

    // 发送消息
    async function sendMessage() {
        if (isProcessing) return;

        const message = userInput.value.trim();
        if (!message) return;

        try {
            isProcessing = true;
            
            // 添加用户消息
            messageHistory.push({
                role: "user",
                content: message
            });
            addMessage(message, 'user');
            userInput.value = '';

            // 显示加载状态
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chat-message ai-message loading';
            loadingDiv.textContent = '正在思考';
            chatBox.appendChild(loadingDiv);

            try {
                // 调用 AI API
                const aiResponse = await callAI();
                
                // 添加 AI 响应
                messageHistory.push({
                    role: "assistant",
                    content: aiResponse
                });
                addMessage(aiResponse, 'ai');
            } catch (error) {
                addMessage(`抱歉，发生了错误：${error.message}`, 'ai');
            } finally {
                // 移除加载状态
                if (loadingDiv.parentNode) {
                    chatBox.removeChild(loadingDiv);
                }
            }

        } catch (error) {
            console.error('发送消息时出错:', error);
            addMessage('抱歉，发生了错误，请稍后重试。', 'ai');
        } finally {
            isProcessing = false;
        }
    }

    // 开始对话
    startChatBtn.addEventListener('click', function() {
        startChatBtn.style.display = 'none';
        sendMessageBtn.style.display = 'block';
        userInput.focus();
        
        addMessage('AI 助手已准备就绪，请输入您的问题。', 'ai');
    });

    // 发送按钮点击事件
    sendMessageBtn.addEventListener('click', sendMessage);

    // 输入框回车事件
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 添加消息到聊天框
    function addMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${type}-message`);
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}); 