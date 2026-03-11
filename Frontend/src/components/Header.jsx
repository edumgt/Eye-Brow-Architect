import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const { isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <header style={styles.header}>
            <div style={styles.container}>
                <Link to="/" style={styles.logo}>
                    Eye-Brow <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>Architect</span>
                </Link>
                <nav style={styles.nav}>
                    <button onClick={toggleTheme} style={styles.themeToggle}>
                        {isDarkMode ? '🌞' : '🌙'}
                    </button>
                    <div style={styles.navDivider}></div>
                    <Link to="/" style={{ ...styles.navLink, ...(isActive('/') ? styles.activeLink : {}) }}>커뮤니티</Link>
                    <Link to="/counseling" style={{ ...styles.navLink, ...(isActive('/counseling') ? styles.activeLink : {}) }}>AI 컨설팅</Link>
                    {user ? (
                        <>
                            <Link to="/mypage" style={{ ...styles.navLink, ...(isActive('/mypage') ? styles.activeLink : {}) }}>마이페이지</Link>
                            <button onClick={handleLogout} style={styles.loginBtn}>로그아웃</button>
                        </>
                    ) : (
                        <Link to="/login" style={styles.loginBtn}>로그인</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

const styles = {
    header: {
        width: '100%',
        height: '90px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '0 40px',
    },
    container: {
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '900',
        textDecoration: 'none',
        color: 'var(--accent-primary)',
        letterSpacing: '-1.5px',
        fontFamily: 'var(--font-display)',
    },
    navLink: {
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        fontWeight: '700',
        fontSize: '0.85rem',
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        transition: 'var(--transition-smooth)',
        fontFamily: 'var(--font-display)',
    },
    activeLink: {
        background: 'var(--border-light)',
        color: 'var(--accent-primary)',
    },
    loginBtn: {
        fontSize: '0.85rem',
        fontWeight: '700',
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '10px 24px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        border: 'none',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
    },
    premiumBadge: {
        fontSize: '0.65rem',
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        marginRight: '12px',
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    themeToggle: {
        background: 'none',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s ease',
    },
    navDivider: {
        width: '1px',
        height: '20px',
        background: 'var(--glass-border)',
        margin: '0 8px',
    }
};

export default Header;
