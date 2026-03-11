import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/Header';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg);
            }

            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify(userData));

            alert('Welcome back!');
            navigate('/mypage');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={styles.container}>
            <GlobalHeader />
            <div style={styles.content}>
                <div className="glass-panel" style={styles.card}>
                    <h2 style={styles.title}>다시 만나서 반가워요</h2>
                    <p style={styles.desc}>로그인하여 당신만의 뷰티 디자인을 계속해 보세요.</p>

                    <form onSubmit={handleLogin} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>이메일 주소</label>
                            <input
                                type="email"
                                style={styles.input}
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>비밀번호</label>
                            <input
                                type="password"
                                style={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p style={styles.error}>{error}</p>}

                        <button type="submit" style={styles.loginBtn}>로그인</button>
                    </form>

                    <div style={styles.footer}>
                        계정이 없으신가요? <Link to="/signup" style={styles.link}>회원가입하기</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    content: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { width: '100%', maxWidth: '420px', padding: '50px 40px', textAlign: 'center' },
    title: { fontSize: '2rem', fontWeight: '800', marginBottom: '10px' },
    desc: { color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '0.95rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' },
    input: { padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem' },
    error: { color: '#ff4757', fontSize: '0.85rem', fontWeight: '600' },
    loginBtn: { padding: '16px', background: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' },
    footer: { marginTop: '30px', fontSize: '0.9rem', color: 'var(--text-secondary)' },
    link: { color: 'var(--accent-primary)', fontWeight: '700', textDecoration: 'none' }
};

export default LoginPage;
