from flask import Flask, request, jsonify  # Flask框架相关组件
from flask_cors import CORS  # 处理跨域请求
from openai import OpenAI  # OpenAI/Kimi API 客户端

app = Flask(__name__)  # 创建 Flask 应用
CORS(app)  # 启用跨域支持

# 配置 Kimi API 客户端
client = OpenAI(
    api_key="your_moonshot_api_key",  # Kimi API密钥
    base_url="https://api.moonshot.cn/v1",  # Kimi API地址
)

# 系统提示词，用于设定AI助手的行为和特征
SYSTEM_PROMPT = """你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。
你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。
Moonshot AI 为专有名词，不可翻译成其他语言。"""

@app.route('/chat', methods=['POST'])  # 定义POST路由
def chat():
    try:
        # 获取前端发送的消息
        data = request.json
        messages = data.get('messages', [])
        
        # 构建完整的消息列表，加入系统提示
        full_messages = [
            {"role": "system", "content": SYSTEM_PROMPT}  # 系统提示
        ] + messages  # 用户对话历史
        
        # 调用 Kimi API 获取回复
        completion = client.chat.completions.create(
            model="moonshot-v1-8k",  # 使用的模型
            messages=full_messages,   # 完整的消息历史
            temperature=0.3          # 温度参数，控制回复的随机性
        )
        
        # 获取AI的回复
        response = completion.choices[0].message.content
        
        # 返回格式化的响应
        return jsonify({
            "choices": [{
                "message": {
                    "content": response,  # AI的回复内容
                    "role": "assistant"   # 角色标识
                }
            }]
        })
            
    except Exception as e:
        print(f"Server error: {str(e)}")  # 打印错误信息
        return jsonify({"error": str(e)}), 500  # 返回错误响应 

if __name__ == '__main__':
    app.run(port=5000, debug=True)  # 在5000端口启动服务器