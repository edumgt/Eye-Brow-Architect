import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/Header';
import { useNavigate } from 'react-router-dom';

const MembershipPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handlePaymentComplete = async () => {
        setLoading(true);
        setShowPaymentModal(false);
        try {
            const res = await fetch(`/api/membership/upgrade/${user.userId}`, { method: 'POST' });
            if (res.ok) {
                const updatedUser = await res.json();
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert('프리미엄 멤버십으로 업그레이드되었습니다! ✨');
                navigate('/mypage');
            }
        } catch (err) {
            console.error("멤버십 전환 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("정말 멤버십을 해지하시겠습니까? 무제한 분석과 챗봇 기능을 더 이상 이용할 수 없게 됩니다.")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/membership/cancel/${user.userId}`, { method: 'POST' });
            if (res.ok) {
                const updatedUser = await res.json();
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                alert('멤버십이 해지되었습니다. 기본 회원(FREE)으로 전환되었습니다.');
                navigate('/mypage');
            }
        } catch (err) {
            console.error("해지 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <GlobalHeader />
            <motion.main
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: "anticipate" }}
                style={styles.contentWrapper}
            >
                <div style={styles.header}>
                    <h1 style={styles.title}>멤버십 한도 업그레이드</h1>
                    <p style={styles.subtitle}>더 정밀한 분석과 무제한 챗봇 상담을 경험하세요.</p>
                </div>

                <div style={styles.grid}>
                    {/* Free Plan */}
                    <div className="glass-panel" style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.planName}>기본 (Free)</h3>
                            <div style={styles.price}>₩ 0 <span style={styles.period}>/ 월</span></div>
                        </div>
                        <ul style={styles.featureList}>
                            <li style={styles.featureItem}>✅ 하루 2회 눈썹 분석</li>
                            <li style={styles.featureItem}>✅ 기본 디자인 추천</li>
                            <li style={styles.featureItem}>❌ 챗봇 무제한 상담</li>
                            <li style={styles.featureItem}>❌ 프리미엄 가이드 제공</li>
                        </ul>
                        <button disabled style={styles.currentBtn}>현재 등급</button>
                    </div>

                    {/* Premium Plan */}
                    <div className="glass-panel" style={{ ...styles.card, ...styles.premiumCard }}>
                        <div style={styles.premiumBadge}>BEST VALUE</div>
                        <div style={styles.cardHeader}>
                            <h3 style={{ ...styles.planName, color: 'var(--accent-primary)' }}>프리미엄 (Premium)</h3>
                            <div style={styles.price}>₩ 9,900 <span style={styles.period}>/ 월</span></div>
                        </div>
                        <ul style={styles.featureList}>
                            <li style={styles.featureItem}>✨ 무제한 눈썹 분석</li>
                            <li style={styles.featureItem}>✨ 챗봇 1:1 무제한 컨설팅</li>
                            <li style={styles.featureItem}>✨ 전용 프리미엄 메이크업 가이드</li>
                            <li style={styles.featureItem}>✨ 신규 디자인 우선 제공</li>
                        </ul>
                        {user?.membershipTier === 'PREMIUM' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button disabled style={styles.currentBtn}>✨ 프리미엄 이용 중</button>
                                <button onClick={handleCancel} disabled={loading} style={styles.cancelBtn}>
                                    {loading ? '처리 중...' : '멤버십 해지하기'}
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowPaymentModal(true)} disabled={loading} style={styles.upgradeBtn}>
                                {loading ? '처리 중...' : '지금 바로 업그레이드'}
                            </button>
                        )}
                    </div>
                </div>

                <div style={styles.policy}>
                    * 본 결제 및 해지는 프로젝트 데모용이며, 실제 금융 거래가 발생하지 않습니다.
                </div>
            </motion.main>

            {/* Mock Payment Modal */}
            {showPaymentModal && (
                <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()} className="fade-in">
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>안전 결제</h2>
                            <button onClick={() => setShowPaymentModal(false)} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.paymentInfo}>
                            <div style={styles.productRow}>
                                <span>아이브로우 아키텍트 프리미엄 (1개월)</span>
                                <span style={styles.totalPrice}>₩ 9,900</span>
                            </div>
                        </div>
                        <div style={styles.cardInputGroup}>
                            <label style={styles.inputLabel}>카드 번호</label>
                            <input style={styles.input} placeholder="0000 0000 0000 0000" defaultValue="4242 4242 4242 4242" />
                            <div style={styles.inputRow}>
                                <div style={{ flex: 1 }}>
                                    <label style={styles.inputLabel}>유효기간</label>
                                    <input style={styles.input} placeholder="MM / YY" defaultValue="12 / 26" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={styles.inputLabel}>CVC</label>
                                    <input style={styles.input} placeholder="123" defaultValue="123" />
                                </div>
                            </div>
                        </div>
                        <button onClick={handlePaymentComplete} style={styles.payBtn}>
                            {loading ? '처리 중...' : '9,900원 결제하고 업그레이드'}
                        </button>
                        <p style={styles.secureHint}>🔒 모든 결제 정보는 암호화되어 안전하게 처리됩니다.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: { width: '100%', minHeight: '100vh', background: 'var(--bg-main)' },
    content: { maxWidth: '1000px', margin: '0 auto', padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { textAlign: 'center', marginBottom: '60px' },
    title: { fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.02em' },
    subtitle: { color: 'var(--text-secondary)', fontSize: '1.1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', width: '100%' },
    card: { padding: '40px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' },
    premiumCard: { border: '2px solid var(--accent-primary)', boxShadow: '0 20px 40px rgba(97, 218, 251, 0.15)', position: 'relative' },
    premiumBadge: { position: 'absolute', top: '-15px', right: '30px', background: 'var(--accent-primary)', color: 'var(--bg-main)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '900' },
    cardHeader: { marginBottom: '30px' },
    planName: { fontSize: '1.25rem', fontWeight: '800', marginBottom: '10px' },
    price: { fontSize: '2rem', fontWeight: '900' },
    period: { fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' },
    featureList: { listStyle: 'none', padding: 0, margin: '0 0 40px 0', flex: 1 },
    featureItem: { marginBottom: '16px', fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '500' },
    currentBtn: { padding: '16px', background: 'var(--border-light)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: '700', cursor: 'default' },
    upgradeBtn: { padding: '16px', background: 'var(--accent-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--bg-main)', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.2s ease', boxShadow: '0 10px 20px rgba(97, 218, 251, 0.3)' },
    cancelBtn: { padding: '12px', background: 'none', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease' },
    policy: { marginTop: '40px', fontSize: '0.85rem', color: 'var(--text-muted)' },

    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalContent: { background: 'var(--bg-card)', width: '90%', maxWidth: '450px', borderRadius: '24px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    modalTitle: { fontSize: '1.25rem', fontWeight: '900' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' },
    paymentInfo: { background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--border-light)' },
    productRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' },
    totalPrice: { color: 'var(--text-primary)', fontWeight: '900' },
    cardInputGroup: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' },
    inputLabel: { fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' },
    input: { width: '100%', padding: '12px 16px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-primary)' },
    inputRow: { display: 'flex', gap: '16px' },
    payBtn: { width: '100%', padding: '16px', background: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', marginBottom: '16px' },
    secureHint: { textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }
};

export default MembershipPage;
