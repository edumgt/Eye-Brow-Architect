import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import GlobalHeader from '../components/Header';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AnalysisDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            fetch(`/api/history/user/${parsedUser.userId}`)
                .then(res => res.json())
                .then(data => {
                    setHistory(data);
                    setLoading(false);
                });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (loading) return <div style={styles.loading}>분석 데이터를 집계하는 중...</div>;

    // Process Data
    const shapeCounts = history.reduce((acc, curr) => {
        acc[curr.faceShape] = (acc[curr.faceShape] || 0) + 1;
        return acc;
    }, {});

    const pieData = {
        labels: Object.keys(shapeCounts),
        datasets: [{
            data: Object.values(shapeCounts),
            backgroundColor: ['var(--accent-primary)', '#6366f1', '#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
        }]
    };

    const timelineData = {
        labels: history.slice(0, 10).reverse().map(h => new Date(h.createdAt).toLocaleDateString()),
        datasets: [{
            label: '분석 이력',
            data: history.slice(0, 10).reverse().map((_, i) => i + 1),
            borderColor: 'var(--accent-primary)',
            tension: 0.4,
            fill: false,
        }]
    };

    return (
        <div style={styles.container}>
            <GlobalHeader />
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.content}
            >
                <header style={styles.header}>
                    <h1 style={styles.title}>분석 대시보드</h1>
                    <p style={styles.subtitle}>당신의 스타일 변화와 안면 분석 데이터를 한눈에 확인하세요.</p>
                </header>

                <div style={styles.grid}>
                    <div className="glass-panel" style={styles.chartCard}>
                        <h3 style={styles.chartTitle}>인식된 얼굴형 분포</h3>
                        <div style={styles.chartWrap}>
                            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    <div className="glass-panel" style={styles.chartCard}>
                        <h3 style={styles.chartTitle}>최근 활동 추이</h3>
                        <div style={styles.chartWrap}>
                            <Line data={timelineData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    <div className="glass-panel" style={styles.fullCard}>
                        <h3 style={styles.chartTitle}>상세 분석 통계</h3>
                        <div style={styles.statsRow}>
                            <div style={styles.statBox}>
                                <span style={styles.statLabel}>총 분석 횟수</span>
                                <span style={styles.statValue}>{history.length}</span>
                            </div>
                            <div style={styles.statBox}>
                                <span style={styles.statLabel}>주요 얼굴형</span>
                                <span style={styles.statValue}>{Object.keys(shapeCounts)[0] || '-'}</span>
                            </div>
                            <div style={styles.statBox}>
                                <span style={styles.statLabel}>멤버십 등급</span>
                                <span style={styles.statValue}>{user?.membershipTier}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', background: 'var(--bg-main)' },
    content: { maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' },
    loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem' },
    header: { marginBottom: '48px' },
    title: { fontSize: '2.5rem', fontWeight: '900', marginBottom: '8px' },
    subtitle: { color: 'var(--text-secondary)', fontSize: '1.1rem' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' },
    chartCard: { padding: '32px', height: '400px', display: 'flex', flexDirection: 'column' },
    fullCard: { gridColumn: '1 / -1', padding: '40px' },
    chartTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '24px' },
    chartWrap: { flex: 1, minHeight: 0 },
    statsRow: { display: 'flex', gap: '48px' },
    statBox: { display: 'flex', flexDirection: 'column' },
    statLabel: { fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' },
    statValue: { fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)' }
};

export default AnalysisDashboard;
