import React, { useState, useEffect, useRef } from 'react';

const ChatbotModal = ({ isOpen, onClose, user }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: '안녕하세요! 나혜님만의 퍼스널 아이브로우 아키텍트입니다. 😊' },
        { role: 'bot', text: '오늘의 화장 목적이나 궁금한 점을 말씀해 주세요. (예: 면접 메이크업, 데이트 눈썹 추천 등)' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch('/api/lex/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, sessionId: user?.userId || 'guest-session' })
            });
            const data = await response.json();

            const botResponse = data.response || "이해하지 못했어요. 다시 말씀해 주시겠어요?";
            setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
            setLoading(false);
        } catch (err) {
            console.error("챗봇 오류:", err);
            setMessages(prev => [...prev, { role: 'bot', text: "상담 서비스에 일시적인 연결 문제가 발생했습니다." }]);
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div className="glass-panel" style={styles.container}>
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        <span style={styles.logo}>🤖</span>
                        <div>
                            <h3 style={styles.name}>AI 시뮬레이터 챗봇</h3>
                            <span style={styles.status}>온라인</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                <div style={styles.chatArea} ref={scrollRef}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{ ...styles.msgWrapper, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.botBubble) }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && <div style={styles.loading}>답변 생성 중...</div>}
                </div>

                <form onSubmit={handleSend} style={styles.inputArea}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        style={styles.input}
                    />
                    <button type="submit" style={styles.sendBtn}>➔</button>
                </form>

                <div style={styles.usageTip}>
                    매일 2건의 무료 분석이 제공됩니다. (현재: {user?.dailyAnalysisCount}/2)
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', bottom: '100px', right: '40px', zIndex: 3000, width: '380px' },
    container: { display: 'flex', flexDirection: 'column', height: '550px', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
    header: { padding: '20px', background: 'var(--accent-primary)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { display: 'flex', alignItems: 'center', gap: '12px' },
    logo: { fontSize: '1.5rem' },
    name: { fontSize: '1rem', fontWeight: '800', margin: 0 },
    status: { fontSize: '0.7rem', opacity: 0.8 },
    closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' },
    chatArea: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', background: '#f9f9f9' },
    msgWrapper: { maxWidth: '85%' },
    bubble: { padding: '12px 16px', borderRadius: '18px', fontSize: '0.9rem', lineHeight: 1.5 },
    userBubble: { background: 'var(--accent-primary)', color: '#fff', borderBottomRightRadius: '4px' },
    botBubble: { background: '#fff', color: 'var(--text-primary)', borderBottomLeftRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    loading: { fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '5px' },
    inputArea: { padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' },
    input: { flex: 1, border: 'none', background: '#f3f4f6', padding: '12px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', outline: 'none' },
    sendBtn: { background: 'var(--accent-primary)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontWeight: '900' },
    usageTip: { padding: '10px', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', background: '#fff', borderTop: '1px solid #f3f4f6' }
};

export default ChatbotModal;
