import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalHeader from '../components/Header';
import CanvasOverlay from '../components/CanvasOverlay';

const CounselingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [showFaceAnalysis, setShowFaceAnalysis] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '안녕하세요! 나혜님을 위한 맞춤형 뷰티 컨설팅을 시작합니다. 😊' }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    else navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/users/${user.userId}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        if (data.faceShape) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now() + 1,
              sender: 'bot',
              text: `나혜님의 현재 얼굴형은 [${data.faceShape}]로 분석되어 있습니다. ✨ 오늘 어떤 스타일을 추천받고 싶으신가요?`
            }]);
          }, 800);
        }
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [user]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const input = chatInput;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: input }]);
    setChatInput('');

    try {
      const response = await fetch('/api/lex/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId: user?.userId || 'guest' })
      });
      const data = await response.json();
      const botResponse = data.response || "죄송해요, 다시 말씀해주시겠어요?";
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);

      const lower = botResponse.toLowerCase();
      if (lower.includes("가이드") || lower.includes("추천") || lower.includes("좌표")) {
        fetch(`/api/posts/user/${user?.userId || 1}`)
          .then(res => res.json())
          .then(rec => {
            const customized = { ...rec, imageUrl: null };
            setRecommendation(customized);
            setShowResult(true);
          });
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "연동 오류가 발생했습니다." }]);
    }
  };

  const handleSaveHistory = () => {
    if (!userData || !recommendation) return;
    const historyData = {
      imageUrl: userData.faceImageUrl,
      faceShape: userData.faceShape,
      eyebrowCoords: userData.eyebrowCoords,
      recommendedDesign: recommendation.title,
      recommendedColor: recommendation.recommendedPencilColor,
      analysisAdvice: recommendation.analysisAdvice,
      isMain: false
    };

    fetch(`/api/history/user/${user.userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyData)
    })
      .then(res => {
        if (res.ok) alert("상담 기록이 저장되었습니다! ✨");
        else res.text().then(text => alert(text || "저장 실패"));
      })
      .catch(err => console.error("저장 오류:", err));
  };

  const parseCoords = (coordStr) => {
    if (!coordStr) return null;
    try {
      const parsed = typeof coordStr === 'string' ? JSON.parse(coordStr) : coordStr;
      return parsed;
    } catch (e) { return null; }
  };

  return (
    <div style={styles.container}>
      <GlobalHeader title="AI CONSULTING" />
      <main style={styles.contentWrapper}>
        <div style={styles.mainLayout}>

          {/* Left: Chat Pane (380px) */}
          <section style={styles.sectionCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.headerTitle}>AI 뷰티 아키텍트</h2>
              <button onClick={() => setShowFaceAnalysis(!showFaceAnalysis)} style={styles.toggleBtn}>
                {showFaceAnalysis ? '닫기' : '분석 요약'}
              </button>
            </div>

            <AnimatePresence>
              {showFaceAnalysis && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={styles.analysisPanel}>
                  <img src={userData?.faceImageUrl} style={styles.miniPhoto} alt="face" />
                  <div style={{ flex: 1 }}>
                    <p style={styles.faceTag}>얼굴형: <strong>{userData?.faceShape}</strong></p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={styles.chatBox}>
              {messages.map(m => (
                <div key={m.id} style={{ ...styles.bubble, ...(m.sender === 'bot' ? styles.botBubble : styles.userBubble) }}>
                  {m.text}
                </div>
              ))}
            </div>

            <div style={styles.inputArea}>
              <input type="text" style={styles.input} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} />
              <button style={styles.sendBtn} onClick={handleSendMessage}>전송</button>
            </div>
          </section>

          {/* Right: Studio Pane (Conditional) */}
          <AnimatePresence>
            {showResult && (
              <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={styles.sectionCard}
              >
                <div style={styles.cardHeader}>
                  <h2 style={styles.headerTitle}>분석 가이드 스튜디오</h2>
                  <div style={styles.badge}>{userData?.faceShape}</div>
                </div>

                <div style={styles.photoArea}>
                  {userData?.faceImageUrl ? (
                    <CanvasOverlay
                      imageSrc={userData.faceImageUrl}
                      guideSrc={recommendation?.imageUrl}
                      coordinates={parseCoords(userData.eyebrowCoords)}
                    />
                  ) : <p style={{ color: '#444' }}>사진 로딩 중...</p>}
                </div>

                <div style={styles.resultDetails}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={styles.recTitle}>{recommendation?.title}</h3>
                    <button onClick={() => setShowResult(false)} style={styles.closeBtn}>✕</button>
                  </div>
                  <div style={styles.adviceBox}>{recommendation?.analysisAdvice}</div>
                  <button onClick={handleSaveHistory} style={styles.saveBtn}>✨ 상담 결과 저장</button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
};

const styles = {
  container: { width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', overflow: 'hidden' },
  contentWrapper: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' },
  mainLayout: { display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center' },

  sectionCard: { width: '380px', height: '620px', background: 'var(--bg-card)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: 'var(--glass-shadow)' },
  cardHeader: { padding: '18px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.02)' },
  headerTitle: { fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-primary)', margin: 0 },
  toggleBtn: { background: 'none', border: '1px solid #111', color: '#111', padding: '4px 10px', borderRadius: '10px', fontSize: '0.7rem', cursor: 'pointer' },

  analysisPanel: { padding: '15px 24px', background: 'rgba(0,0,0,0.02)', display: 'flex', gap: '15px', alignItems: 'center', borderBottom: '1px solid var(--border-light)', overflow: 'hidden' },
  miniPhoto: { width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #eee' },
  faceTag: { fontSize: '0.85rem', color: 'var(--text-primary)', margin: 0 },

  chatBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fff' },
  bubble: { maxWidth: '85%', padding: '12px 16px', borderRadius: '16px', fontSize: '0.9rem', lineHeight: '1.5' },
  botBubble: { alignSelf: 'flex-start', background: '#f3f4f6', color: 'var(--text-primary)', borderBottomLeftRadius: '4px' },
  userBubble: { alignSelf: 'flex-end', background: '#111', color: '#fff', borderBottomRightRadius: '4px', fontWeight: '600' },

  inputArea: { padding: '15px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '10px', background: '#fff' },
  input: { flex: 1, height: '44px', background: '#f9fafb', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0 15px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' },
  sendBtn: { background: '#111', color: '#fff', padding: '0 18px', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '0.9rem' },

  badge: { background: '#111', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800' },
  photoArea: { width: '100%', height: '300px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  resultDetails: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#fff' },
  recTitle: { fontSize: '1.1rem', color: '#111', margin: '0 0 12px 0', fontWeight: '900', borderBottom: '2px solid #111', paddingBottom: '5px', display: 'inline-block' },
  adviceBox: { padding: '16px', background: '#f9fafb', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1, marginBottom: '15px', border: '1px solid #f3f4f6' },
  saveBtn: { width: '100%', padding: '14px', background: '#111', color: '#fff', borderRadius: '12px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '0.9rem' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: '1.1rem', cursor: 'pointer' }
};

export default CounselingPage;
