import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalHeader from '../components/Header';

// Force refresh - 2026-03-05-v2

const MainPage = () => {
    const [stylesList, setStylesList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [selectedShape, setSelectedShape] = useState('All');
    const [isAdding, setIsAdding] = useState(false);
    const [user, setUser] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));

        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                const formattedData = data.map(d => ({
                    id: d.postId,
                    name: d.title,
                    description: d.description,
                    imageUrl: d.imageUrl,
                    faceShape: d.targetFaceShape || 'Unknown',
                    likes: d.likeCount || 0,
                    views: d.viewCount || 0,
                    scrapped: false
                }));
                setStylesList(formattedData);
                setFilteredList(formattedData);
            })
            .catch(err => console.error("디자인 로드 실패:", err));
    }, []);

    useEffect(() => {
        if (selectedShape === 'All') {
            setFilteredList(stylesList);
        } else {
            setFilteredList(stylesList.filter(s => s.faceShape === selectedShape));
        }
    }, [selectedShape, stylesList]);

    const handleFetchComments = (postId) => {
        fetch(`/api/comments/post/${postId}`)
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.error("댓글 로드 실패:", err));
    };

    const handleAddComment = () => {
        if (!user || !newComment.trim()) return;
        const request = {
            postId: selectedPost.id,
            userId: user.userId,
            content: newComment
        };
        fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        })
            .then(res => res.json())
            .then(() => {
                setNewComment('');
                handleFetchComments(selectedPost.id);
            })
            .catch(err => console.error("댓글 저장 실패:", err));
    };

    const handleToggleScrap = (designId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetch(`/api/scraps/toggle?userId=${user.userId}&postId=${designId}`, { method: 'POST' })
            .then(() => {
                setStylesList(stylesList.map(s => {
                    if (s.id === designId) {
                        const isScrapped = !s.scrapped;
                        return { ...s, scrapped: isScrapped, likes: isScrapped ? s.likes + 1 : s.likes - 1 };
                    }
                    return s;
                }));
            })
            .catch(err => console.error("스크랩 실패:", err));
    };

    const faceShapes = ['All', '달걀형', '둥근형', '각진형', '긴 얼굴형', '하트형'];

    return (
        <div style={styles.container}>
            <GlobalHeader />
            <motion.main
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={styles.contentWrapper}
            >
                <header style={styles.pageHeader}>
                    <div>
                        <h1 style={styles.title}>스타일 커뮤니티</h1>
                        <p style={styles.subtitle}>당신만의 독특한 얼굴형에 딱 맞는 눈썹 아키텍처를 발견해 보세요.</p>

                        <div style={styles.filterBar}>
                            {faceShapes.map(shape => (
                                <button
                                    key={shape}
                                    onClick={() => setSelectedShape(shape)}
                                    style={{
                                        ...styles.filterTab,
                                        ...(selectedShape === shape ? styles.activeTab : {})
                                    }}
                                >
                                    {shape}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (!user) navigate('/login');
                            else setIsAdding(!isAdding);
                        }}
                        style={isAdding ? styles.cancelBtn : styles.addBtn}
                    >
                        {isAdding ? '닫기' : '스타일 공유하기'}
                    </button>
                </header>

                {isAdding && (
                    <section style={styles.formContainer}>
                        <form onSubmit={(e) => { e.preventDefault(); setIsAdding(false); }} className="glass-panel" style={styles.formGlass}>
                            <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>나의 디자인 공유하기</h3>
                            <div style={styles.formGroup}>
                                <input style={styles.input} placeholder="스타일 명칭" />
                            </div>
                            <div style={styles.formGroup}>
                                <textarea style={{ ...styles.input, height: '120px', resize: 'none' }} placeholder="이 디자인에 대해 설명해 주세요..." />
                            </div>
                            <button type="submit" style={styles.submitBtn}>커뮤니티에 게시하기</button>
                        </form>
                    </section>
                )}

                <div style={styles.grid}>
                    {filteredList.map((style) => (
                        <article
                            key={style.id}
                            className="glass-panel"
                            style={styles.cardGlass}
                            onClick={() => {
                                setSelectedPost(style);
                                handleFetchComments(style.id);
                            }}
                        >
                            <div style={styles.cardVisual}>
                                <img src={style.imageUrl || '/design_placeholder.png'} alt={style.name} style={styles.cardImg} />
                                <div style={styles.cardOverlay}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleScrap(style.id);
                                        }}
                                        style={styles.scrapBtn}
                                    >
                                        {style.scrapped ? '❤️' : '♡'}
                                    </button>
                                </div>
                                <div style={styles.shapeBadge}>{style.faceShape}</div>
                            </div>
                            <div style={styles.cardBody}>
                                <div style={styles.metrics}>
                                    <span style={styles.metricItem}>• 조회 {style.views.toLocaleString()}</span>
                                    <span style={styles.metricItem}>• 좋아요 {style.likes.toLocaleString()}</span>
                                </div>
                                <h3 style={styles.cardTitle}>{style.name}</h3>
                                <p style={styles.cardText}>{style.description}</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/counseling');
                                    }}
                                    style={styles.cardActionBtn}
                                >
                                    이 스타일 적용하기
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </motion.main>

            {/* Post Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <div style={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={styles.detailModal}
                            className="glass-panel"
                        >
                            <button style={styles.closeBtn} onClick={() => setSelectedPost(null)}>✕</button>
                            <div style={styles.modalContent}>
                                <div style={styles.modalImageSide}>
                                    <img src={selectedPost.imageUrl} alt={selectedPost.name} style={styles.modalImg} />
                                </div>
                                <div style={styles.modalInfoSide}>
                                    <div style={styles.modalHeader}>
                                        <div style={styles.modalBadge}>{selectedPost.faceShape}</div>
                                        <h2 style={styles.modalTitle}>{selectedPost.name}</h2>
                                        <p style={styles.modalDesc}>{selectedPost.description}</p>
                                    </div>

                                    <div style={styles.commentSection}>
                                        <h4 style={styles.commentTitle}>피드백 ({comments.length})</h4>
                                        <div style={styles.commentList}>
                                            {comments.length === 0 ? (
                                                <p style={styles.emptyComments}>첫 번째 피드백을 남겨보세요!</p>
                                            ) : (
                                                comments.map(c => (
                                                    <div key={c.commentId} style={styles.commentItem}>
                                                        <div style={styles.commentMeta}>
                                                            <span style={styles.commentUser}>{c.user?.nickname || '사용자'}</span>
                                                            <span style={styles.commentDate}>{new Date(c.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p style={styles.commentText}>{c.content}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div style={styles.commentInputArea}>
                                            <input
                                                style={styles.commentInput}
                                                placeholder={user ? "칭찬이나 질문을 남겨보세요..." : "로그인 후 이용 가능합니다."}
                                                value={newComment}
                                                onChange={e => setNewComment(e.target.value)}
                                                disabled={!user}
                                            />
                                            <button
                                                style={styles.commentSubmit}
                                                onClick={handleAddComment}
                                                disabled={!user || !newComment.trim()}
                                            >
                                                게시
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        minHeight: '100vh',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 24px',
    },
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '60px',
    },
    title: {
        fontSize: '3.5rem',
        color: 'var(--text-primary)',
        margin: 0,
        lineHeight: 1,
    },
    subtitle: {
        color: 'var(--text-secondary)',
        fontSize: '1.1rem',
        marginTop: '12px',
        maxWidth: '500px',
    },
    addBtn: {
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '14px 28px',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.95rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    cancelBtn: {
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        padding: '14px 28px',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.95rem',
        border: '1px solid var(--border-light)',
    },
    formContainer: {
        marginBottom: '60px',
        display: 'flex',
        justifyContent: 'center',
    },
    formGlass: {
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
    },
    formGroup: { marginBottom: '16px' },
    input: { width: '100%' },
    submitBtn: {
        width: '100%',
        padding: '16px',
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        borderRadius: 'var(--radius-md)',
        fontSize: '1rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '40px',
    },
    cardGlass: {
        overflow: 'hidden',
        transition: 'var(--transition-smooth)',
        cursor: 'default',
        backgroundColor: 'var(--bg-card)',
    },
    cardVisual: {
        height: '240px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-main)',
    },
    cardImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'var(--transition-smooth)',
    },
    cardOverlay: {
        position: 'absolute',
        top: '16px',
        right: '16px',
    },
    scrapBtn: {
        width: '40px',
        height: '40px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--glass-bg)',
        color: 'var(--accent-primary)',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--glass-border)',
    },
    cardBody: {
        padding: '24px',
    },
    metrics: {
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
    },
    metricItem: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: '1.4rem',
        marginBottom: '8px',
    },
    cardText: {
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginBottom: '24px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        height: '2.85rem',
    },
    cardActionBtn: {
        width: '100%',
        padding: '12px',
        border: '1.5px solid var(--accent-primary)',
        background: 'transparent',
        color: 'var(--accent-primary)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.9rem',
    },
    filterBar: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        overflowX: 'auto',
        paddingBottom: '8px',
    },
    filterTab: {
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.85rem',
        whiteSpace: 'nowrap',
        color: 'var(--text-secondary)',
    },
    activeTab: {
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        borderColor: 'var(--accent-primary)',
    },
    shapeBadge: {
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.7rem',
        fontWeight: '700',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    detailModal: {
        width: '100%',
        maxWidth: '1000px',
        height: '80vh',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    closeBtn: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        border: 'none',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        zIndex: 10,
        fontSize: '1.2rem',
    },
    modalContent: {
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    modalImageSide: {
        flex: 1.2,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalImg: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    },
    modalInfoSide: {
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
    },
    modalHeader: {
        marginBottom: '32px',
    },
    modalBadge: {
        display: 'inline-block',
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.8rem',
        fontWeight: '700',
        marginBottom: '12px',
    },
    modalTitle: {
        fontSize: '2rem',
        fontWeight: '900',
        marginBottom: '12px',
    },
    modalDesc: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
    },
    commentSection: {
        borderTop: '1px solid var(--glass-border)',
        paddingTop: '32px',
        marginTop: 'auto',
    },
    commentTitle: {
        fontSize: '1.1rem',
        fontWeight: '800',
        marginBottom: '20px',
    },
    commentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '24px',
        paddingRight: '8px',
    },
    commentItem: {
        background: 'var(--bg-main)',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)',
    },
    commentMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    commentUser: {
        fontWeight: '700',
        fontSize: '0.85rem',
    },
    commentDate: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
    },
    commentText: {
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
    },
    commentInputArea: {
        display: 'flex',
        gap: '12px',
    },
    commentInput: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)',
        fontSize: '0.9rem',
        background: 'var(--bg-main)',
        color: 'var(--text-primary)',
    },
    commentSubmit: {
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '0 24px',
        borderRadius: 'var(--radius-md)',
        fontWeight: '700',
    }
};

export default MainPage;
