import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/Header';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        nickname: '',
        bio: '',
        age: '',
        gender: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setFormData({
                nickname: parsedUser.nickname || '',
                bio: parsedUser.bio || '',
                age: parsedUser.age || '',
                gender: parsedUser.gender || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch(`/api/users/${user.userId}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
                setUser(updatedUser);
                setMessage('프로필이 성공적으로 업데이트되었습니다! ✨');
            } else {
                setMessage('업데이트 중 오류가 발생했습니다.');
            }
        } catch (err) {
            console.error(err);
            setMessage('서버 통신 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <GlobalHeader />
            <motion.main
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={styles.content}
            >
                <div className="glass-panel" style={styles.card}>
                    <h2 style={styles.title}>계정 설정</h2>
                    <p style={styles.subtitle}>회원님의 프로필 정보를 관리하고 업데이트하세요.</p>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>닉네임</label>
                            <input
                                name="nickname"
                                style={styles.input}
                                value={formData.nickname}
                                onChange={handleChange}
                                placeholder="사용할 닉네임을 입력하세요"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>자기소개</label>
                            <textarea
                                name="bio"
                                style={{ ...styles.input, height: '100px', resize: 'none' }}
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="간단한 자기소개를 남겨주세요"
                            />
                        </div>

                        <div style={styles.row}>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>나이</label>
                                <input
                                    name="age"
                                    type="number"
                                    style={styles.input}
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={{ ...styles.formGroup, flex: 1 }}>
                                <label style={styles.label}>성별</label>
                                <select
                                    name="gender"
                                    style={styles.input}
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="Male">남성</option>
                                    <option value="Female">여성</option>
                                    <option value="Other">기타</option>
                                </select>
                            </div>
                        </div>

                        {message && (
                            <p style={{
                                color: message.includes('성공') ? '#10b981' : '#ef4444',
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                marginBottom: '20px'
                            }}>
                                {message}
                            </p>
                        )}

                        <div style={styles.footer}>
                            <button
                                type="button"
                                onClick={() => navigate('/mypage')}
                                style={styles.backBtn}
                            >
                                돌아가기
                            </button>
                            <button
                                type="submit"
                                style={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? '저장 중...' : '프로필 저장하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.main>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', background: 'var(--bg-main)' },
    content: { maxWidth: '600px', margin: '0 auto', padding: '80px 24px' },
    card: { padding: '50px 40px' },
    title: { fontSize: '2rem', fontWeight: '900', marginBottom: '12px' },
    subtitle: { color: 'var(--text-secondary)', marginBottom: '40px' },
    form: { display: 'flex', flexDirection: 'column' },
    formGroup: { marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' },
    input: { padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '1rem' },
    row: { display: 'flex', gap: '20px' },
    footer: { marginTop: '20px', display: 'flex', gap: '16px' },
    backBtn: { flex: 1, padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' },
    submitBtn: { flex: 2, padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-primary)', color: 'var(--bg-main)', fontWeight: '800', cursor: 'pointer' }
};

export default SettingsPage;
