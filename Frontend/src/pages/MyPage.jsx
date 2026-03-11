import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/Header';
import CanvasOverlay from '../components/CanvasOverlay';
import ChatbotModal from '../components/ChatbotModal';

const MyPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [scraps, setScraps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [error, setError] = useState('');
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [showChatbot, setShowChatbot] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const guideCanvasRef = useRef(null);

    useEffect(() => {
        if (showCamera && guideCanvasRef.current && videoRef.current) {
            const canvas = guideCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const video = videoRef.current;

            const drawGuide = () => {
                if (!showCamera || !video.videoWidth) return;
                canvas.width = video.clientWidth;
                canvas.height = video.clientHeight;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.8;
                ctx.setLineDash([8, 4]);

                const cx = canvas.width / 2;
                const cy = canvas.height * 0.45;
                const rx = canvas.width * 0.28;
                const ry = canvas.height * 0.38;

                // 1. Face Oval
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.stroke();

                // 2. Eye Level Line
                const eyeY = cy - ry * 0.15;
                ctx.setLineDash([4, 8]);
                ctx.beginPath();
                ctx.moveTo(cx - rx * 0.8, eyeY);
                ctx.lineTo(cx + rx * 0.8, eyeY);
                ctx.stroke();

                // 3. Central Symmetry Line
                ctx.beginPath();
                ctx.moveTo(cx, cy - ry);
                ctx.lineTo(cx, cy + ry);
                ctx.stroke();

                // 4. Features
                ctx.setLineDash([]);
                ctx.lineWidth = 2.5;
                const eyeOffsetX = rx * 0.35;
                const markerSize = 8;

                // Left Eye Cross
                ctx.beginPath();
                ctx.moveTo(cx - eyeOffsetX - markerSize, eyeY); ctx.lineTo(cx - eyeOffsetX + markerSize, eyeY);
                ctx.moveTo(cx - eyeOffsetX, eyeY - markerSize); ctx.lineTo(cx - eyeOffsetX, eyeY + markerSize);
                ctx.stroke();

                // Right Eye Cross
                ctx.beginPath();
                ctx.moveTo(cx + eyeOffsetX - markerSize, eyeY); ctx.lineTo(cx + eyeOffsetX + markerSize, eyeY);
                ctx.moveTo(cx + eyeOffsetX, eyeY - markerSize); ctx.lineTo(cx + eyeOffsetX, eyeY + markerSize);
                ctx.stroke();

                // Nose Bridge Marker
                ctx.beginPath();
                ctx.moveTo(cx - 10, cy + ry * 0.2);
                ctx.lineTo(cx, cy + ry * 0.3);
                ctx.lineTo(cx + 10, cy + ry * 0.2);
                ctx.stroke();

                // Mouth Line
                const mouthY = cy + ry * 0.6;
                ctx.beginPath();
                ctx.moveTo(cx - 30, mouthY);
                ctx.lineTo(cx + 30, mouthY);
                ctx.stroke();
            };

            // Use a slight delay or Video metadata load to ensure dimensions are ready
            const interval = setInterval(drawGuide, 100);
            return () => clearInterval(interval);
        }
    }, [showCamera]);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            fetchData(parsedUser.userId);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchData = (id) => {
        setLoading(true);
        Promise.all([
            fetch(`/api/history/user/${id}`).then(res => res.json()),
            fetch(`/api/scraps/user/${id}`).then(res => res.json())
        ]).then(([historyData, scrapData]) => {
            const sortedHistory = Array.isArray(historyData) ? [...historyData].sort((a, b) => {
                if (a.isLatest) return -1;
                if (b.isLatest) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            }) : [];
            setHistory(sortedHistory);
            setScraps(Array.isArray(scrapData) ? scrapData : []);
            setLoading(false);
        }).catch(err => {
            console.error("데이터 로드 실패:", err);
            setLoading(false);
            setScraps([]);
        });
    };

    const handleSetMain = (analysisId, skipConfirm = false) => {
        if (!skipConfirm && !window.confirm("이 사진을 대표 사진으로 설정하시겠습니까? (AI 분석 시 기준이 되는 사진입니다)")) return;
        fetch(`/api/history/${analysisId}/main?userId=${user.userId}`, { method: 'POST' })
            .then(res => {
                if (res.ok) {
                    // Update frontend user data to match new main photo
                    const selected = history.find(h => h.analysisId === analysisId);
                    if (selected) {
                        const updatedUser = {
                            ...user,
                            faceImageUrl: selected.imageUrl,
                            faceShape: selected.faceShape,
                            eyebrowCoords: selected.eyebrowCoords
                        };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                    fetchData(user.userId);
                }
            })
            .catch(err => console.error("메인 설정 실패:", err));
    };

    const handleDelete = (analysisId) => {
        if (!window.confirm("이 분석 기록을 삭제하시겠습니까?")) return;
        fetch(`/api/history/${analysisId}`, { method: 'DELETE' })
            .then(() => fetchData(user.userId))
            .catch(err => console.error("삭제 실패:", err));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setShowCamera(false);
        }
    };

    const startCamera = async () => {
        try {
            setError('');

            // HTTPS 보안 연결 체크 추가
            if (!window.isSecureContext && window.location.hostname !== 'localhost') {
                setError('카메라 기능은 보안 연결(HTTPS) 환경에서만 사용 가능합니다. 주소창의 주소가 https://로 시작하는지 확인해 주세요.');
                return;
            }

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('이 브라우저에서는 카메라 기능을 지원하지 않거나, 보안 연결(HTTPS)이 필요합니다.');
                return;
            }

            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError('카메라를 활성화할 수 없습니다. 권한 허용 여부와 HTTPS 연결을 확인해 주세요.');
            setShowCamera(false);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                setProfileImage(file);
                setPreviewUrl(URL.createObjectURL(blob));
                stopCamera();
            }, 'image/jpeg');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };

    const handleAddPhoto = async (e) => {
        if (e) e.preventDefault();
        if (!profileImage) return;

        setLoading(true);
        const photoData = new FormData();
        photoData.append('file', profileImage);

        try {
            const res = await fetch(`/api/history/user/${user.userId}/upload`, {
                method: 'POST',
                body: photoData
            });

            if (!res.ok) throw new Error("업로드 실패");

            const newHistoryItem = await res.json();

            setProfileImage(null);
            setPreviewUrl(null);
            setShowAddForm(false);

            // Automatically set the new photo as main
            if (newHistoryItem && newHistoryItem.analysisId) {
                handleSetMain(newHistoryItem.analysisId, true);
            } else {
                fetchData(user.userId);
            }
        } catch (err) {
            console.error("사진 추가 실패:", err);
            setError(err.message || "사진 추가에 실패했습니다.");
            setLoading(false);
        }
    };

    const getSafeImageUrl = (url) => {
        if (!url || url === '/default_avatar.png') return '/default_avatar.png';
        if (url.startsWith('http')) return url;

        // Remove leading slash if any, then prepend /uploads/ ensuring no double slashes
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        if (cleanUrl.startsWith('uploads/')) return `/${cleanUrl}`;

        return `/uploads/${cleanUrl}`;
    };

    const handleToggleScrap = (postId) => {
        fetch(`/api/scraps/toggle?userId=${user.userId}&postId=${postId}`, { method: 'POST' })
            .then(() => fetchData(user.userId))
            .catch(err => console.error("스크랩 토글 실패:", err));
    };

    const mainPhoto = history.find(h => h.isLatest);

    return (
        <div style={styles.container}>
            <GlobalHeader />
            <main style={styles.contentWrapper} className="fade-in">
                {/* Profile Header */}
                <section style={styles.profileSection}>
                    <div className="glass-panel" style={styles.profileCard}>
                        <div style={styles.avatarZone}>
                            <div style={styles.avatarOuter}>
                                <img
                                    src={getSafeImageUrl(mainPhoto?.imageUrl)}
                                    alt="Profile"
                                    style={styles.avatarImg}
                                    onError={(e) => {
                                        console.warn("Image load failed, falling back:", e.target.src);
                                        e.target.src = '/default_avatar.png';
                                    }}
                                />
                                {mainPhoto && (
                                    <div style={styles.mainAvatarBadge}>
                                        <span style={{ fontSize: '10px' }}>대표 사진</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={styles.profileMeta}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h2 style={styles.userName}>{user?.name || user?.nickname || '회원'}</h2>
                                <button onClick={() => navigate('/settings')} style={styles.settingsBtn}>⚙️</button>
                            </div>
                            <p style={styles.userBio}>{user?.bio || '환영합니다! 당신만의 아이브로우 아키텍트입니다.'}</p>

                            <div style={styles.membershipRow}>
                                <span style={{
                                    ...styles.tierBadge,
                                    backgroundColor: user?.membershipTier === 'PREMIUM' ? 'var(--accent-primary)' : '#9ca3af'
                                }}>
                                    {user?.membershipTier === 'PREMIUM' ? '프리미엄 회원' : '일반 회원'}
                                </span>
                                <button onClick={() => navigate('/membership')} style={styles.upgradeLink}>
                                    {user?.membershipTier === 'PREMIUM' ? '멤버십 관리 ➔' : '멤버십 업그레이드 ➔'}
                                </button>
                            </div>

                            <div style={styles.usageContainer}>
                                <div style={styles.usageLabelRow}>
                                    <span style={styles.usageLabel}>오늘의 분석 사용량</span>
                                    <span style={styles.usageCount}>{user?.dailyAnalysisCount || 0} / {user?.membershipTier === 'PREMIUM' ? '∞' : '2'}</span>
                                </div>
                                <div style={styles.usageBarBg}>
                                    <div style={{
                                        ...styles.usageBarFill,
                                        width: user?.membershipTier === 'PREMIUM' ? '100%' : `${Math.min((user?.dailyAnalysisCount || 0) * 50, 100)}%`,
                                        backgroundColor: (user?.dailyAnalysisCount >= 2 && user?.membershipTier === 'FREE') ? '#ef4444' : 'var(--accent-primary)'
                                    }} />
                                </div>
                            </div>
                            <p style={styles.userEmail}>{user?.email}</p>
                        </div>
                        <div style={styles.statGrid}>
                            <div style={styles.statItem}>
                                <span style={styles.statVal}>{history.length}</span>
                                <span style={styles.statLabel}>분석 기록</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statVal}>{scraps.length}</span>
                                <span style={styles.statLabel}>스크랩</span>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={styles.dashboardBtn}
                            >
                                분석 대시보드 보기 📊
                            </button>
                        </div>
                    </div>
                </section>

                {/* Face Gallery */}
                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={styles.sectionTitle}>에볼루션 갤러리</h3>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setActiveTooltip(activeTooltip === 'gallery' ? null : 'gallery')}
                                    style={styles.infoIcon}
                                >
                                    ⓘ
                                </button>
                                {activeTooltip === 'gallery' && (
                                    <div style={styles.tooltipBox}>
                                        <strong>에볼루션 갤러리란?</strong>
                                        <p>과거 분석 기록들을 보관하는 컬렉션입니다. '대표 사진'으로 설정된 이미지는 AI 상담 및 대시보드 분석의 기준이 됩니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setShowAddForm(!showAddForm)} style={styles.addBtn}>
                            {showAddForm ? '닫기' : '사진 추가하기'}
                        </button>
                    </div>

                    {showAddForm && (
                        <div style={styles.uploadZone}>
                            <div className="glass-panel" style={styles.uploadForm}>
                                {error && <p style={{ color: '#ff4757', fontSize: '0.8rem', marginBottom: '10px' }}>{error}</p>}
                                {showCamera ? (
                                    <div style={styles.cameraBox}>
                                        <div style={styles.cameraContainer}>
                                            <video ref={videoRef} autoPlay playsInline style={styles.videoPreview} />
                                            <canvas ref={guideCanvasRef} style={styles.guideCanvas} />
                                        </div>
                                        <div style={styles.cameraControls}>
                                            <button onClick={capturePhoto} style={styles.captureBtn}>사진 촬영</button>
                                            <button onClick={stopCamera} style={styles.cancelCameraBtn}>취소</button>
                                        </div>
                                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    </div>
                                ) : (
                                    <div style={styles.fileInterface}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" style={styles.previewImg} />
                                        ) : (
                                            <div style={styles.emptyAvatarPlaceholder}>👤</div>
                                        )}
                                        <div style={styles.actionRow}>
                                            <button onClick={startCamera} style={styles.selectorBtn}>📷 촬영하기</button>
                                            <label htmlFor="file-upload" style={styles.selectorBtn}>📁 파일 찾기</label>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        {profileImage && (
                                            <button onClick={handleAddPhoto} style={styles.submitBtn}>
                                                {loading ? '업로드 중...' : '분석을 위해 저장하기'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={styles.historyGrid}>
                        {loading ? (
                            <div style={styles.emptyState}>컬렉션을 불러오는 중...</div>
                        ) : history.length === 0 ? (
                            <div style={styles.emptyState}>갤러리가 비어 있습니다. 사진을 추가하여 시작해 보세요.</div>
                        ) : (
                            (showAllHistory ? history : history.slice(0, 3)).map((item) => (
                                <article
                                    key={item.analysisId}
                                    className="glass-panel"
                                    style={{ ...styles.historyCard, border: item.isLatest ? '1.5px solid var(--accent-primary)' : '1px solid var(--glass-border)', cursor: 'pointer' }}
                                    onClick={() => setSelectedHistory(item)}
                                >
                                    <div style={styles.cardVisual} className="gallery-item-visual">
                                        <img
                                            src={getSafeImageUrl(item.imageUrl)}
                                            alt="분석 사진"
                                            style={styles.cardImg}
                                            onError={(e) => { e.target.src = '/default_avatar.png'; }}
                                        />
                                        {item.isLatest ? (
                                            <div style={styles.mainBadgeCorner}>
                                                <span>대표</span>
                                            </div>
                                        ) : (
                                            <div
                                                style={{ ...styles.mainBadgeCorner, background: 'var(--text-muted)', boxShadow: 'none', cursor: 'pointer' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetMain(item.analysisId);
                                                }}
                                            >
                                                <span>대표</span>
                                            </div>
                                        )}
                                        {!item.isLatest && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSetMain(item.analysisId);
                                                }}
                                                style={styles.setMainHoverBtn}
                                                className="set-main-hover"
                                            >
                                                대표 설정
                                            </button>
                                        )}
                                    </div>
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardMeta}>
                                            <h4 style={styles.cardTitle}>{item.faceShape || '분석 중...'}</h4>
                                            <span style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={styles.cardDetails}>
                                            <div style={styles.detailRow}>
                                                <span style={styles.detailTitle}>디자인</span>
                                                <span style={styles.detailVal}>{item.recommendedDesign || '-'}</span>
                                            </div>
                                        </div>
                                        <div style={styles.cardActions}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.analysisId);
                                                }}
                                                style={styles.deleteBtn}
                                            >
                                                기록 삭제
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                    {!showAllHistory && history.length > 3 ? (
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button onClick={() => setShowAllHistory(true)} style={styles.viewMoreBtn}>
                                갤러리 전체 보기 ({history.length}) ▾
                            </button>
                        </div>
                    ) : showAllHistory && history.length > 3 ? (
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button onClick={() => setShowAllHistory(false)} style={styles.viewMoreBtn}>
                                갤러리 접기 ▴
                            </button>
                        </div>
                    ) : null}
                </section>

                {/* Consultation Records Section */}
                <section style={{ ...styles.section, marginTop: '80px' }}>
                    <div style={styles.sectionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={styles.sectionTitle}>저장된 상담 기록</h3>
                            <span style={styles.consultBadge}>{history.filter(h => h.analysisAdvice).length}건</span>
                        </div>
                    </div>
                    <div style={styles.consultList}>
                        {history.filter(h => h.analysisAdvice).length === 0 ? (
                            <div style={styles.emptyState}>아직 기록된 상담 내용이 없습니다. 챗봇과 상담을 진행해 보세요.</div>
                        ) : (
                            history.filter(h => h.analysisAdvice).map((rec) => (
                                <article key={rec.analysisId} className="glass-panel" style={styles.consultItem} onClick={() => setSelectedHistory(rec)}>
                                    <div style={styles.consultThumbWrapper}>
                                        <img
                                            src={getSafeImageUrl(rec.imageUrl)}
                                            alt="Thumbnail"
                                            style={styles.consultThumb}
                                            onError={(e) => { e.target.src = '/default_avatar.png'; }}
                                        />
                                        <div style={styles.consultOverlay}>🔍</div>
                                    </div>
                                    <div style={styles.consultMainInfo}>
                                        <div style={styles.consultTopRow}>
                                            <span style={styles.consultBadge}>AI Premium Report</span>
                                            <span style={styles.consultDate}>{new Date(rec.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={styles.consultContent}>
                                            <p style={styles.consultText}>{rec.analysisAdvice.length > 60 ? rec.analysisAdvice.substring(0, 60) + '...' : rec.analysisAdvice}</p>
                                            <div style={styles.consultMeta}>
                                                <span style={styles.tag}># {rec.faceShape}</span>
                                                <span style={styles.tag}># {rec.recommendedDesign}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.consultAction}>
                                        <button style={styles.goDetailBtn}>리포트 보기 ➔</button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                {/* Scrapped Styles */}
                <section style={{ ...styles.section, marginTop: '80px' }}>
                    <div style={styles.sectionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={styles.sectionTitle}>스크랩한 스타일</h3>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setActiveTooltip(activeTooltip === 'scraps' ? null : 'scraps')}
                                    style={styles.infoIcon}
                                >
                                    ⓘ
                                </button>
                                {activeTooltip === 'scraps' && (
                                    <div style={styles.tooltipBox}>
                                        <strong>스크랩한 스타일이란?</strong>
                                        <p>커뮤니티에서 마음에 들어서 저장한 스타일들입니다. 언제든지 상담에서 이 스타일들을 적용해 볼 수 있습니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={styles.scrapsGrid}>
                        {scraps.length === 0 ? (
                            <div style={styles.emptyState}>스크랩한 스타일이 없습니다. 커뮤니티에서 영감을 찾아보세요.</div>
                        ) : (
                            scraps.map((scrap) => (
                                <article key={scrap.scrapId} className="glass-panel" style={styles.scrapCard}>
                                    <div style={styles.scrapVisual}>
                                        <img src={scrap.design.guideImageUrl || '/design_placeholder.png'} alt="Design" style={styles.scrapImg} />
                                        <button
                                            onClick={() => handleToggleScrap(scrap.design?.postId || scrap.design?.id)}
                                            style={styles.unsaveBtn}
                                        >
                                            ❤️
                                        </button>
                                    </div>
                                    <div style={styles.scrapContent}>
                                        <h4 style={styles.scrapTitle}>{scrap.design.eyebrowStyle}</h4>
                                        <p style={styles.scrapDesc}>{scrap.design.faceShape} 최적화</p>
                                        <button onClick={() => navigate('/counseling')} style={styles.scrapAction}>적용하기</button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* History Detail Modal */}
            {selectedHistory && (
                <div style={styles.modalOverlay} onClick={() => setSelectedHistory(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()} className="fade-in">
                        <button style={styles.modalClose} onClick={() => setSelectedHistory(null)}>✕</button>
                        <div style={styles.modalInner}>
                            <div style={styles.modalVisualSide}>
                                <h3 style={styles.modalSubtitle}>분석 결과 리플레이</h3>
                                <div style={styles.modalSimulationBox}>
                                    <CanvasOverlay
                                        imageSrc={getSafeImageUrl(selectedHistory.imageUrl)}
                                        coordinates={(() => {
                                            if (!selectedHistory.eyebrowCoords) return null;
                                            try {
                                                return typeof selectedHistory.eyebrowCoords === 'string' ? JSON.parse(selectedHistory.eyebrowCoords) : selectedHistory.eyebrowCoords;
                                            } catch (e) {
                                                console.error("Coords parse error:", e);
                                                return null;
                                            }
                                        })()}
                                    />
                                </div>
                            </div>
                            <div style={styles.modalInfoSide}>
                                <div style={styles.modalHeader}>
                                    <h2 style={styles.modalTitle}>{selectedHistory.faceShape} 맞춤 리포트</h2>
                                    <span style={styles.modalDate}>{new Date(selectedHistory.createdAt).toLocaleString()}</span>
                                </div>
                                <div style={styles.detailList}>
                                    {selectedHistory.analysisAdvice && (
                                        <div style={styles.expertGuideCard}>
                                            <div style={styles.expertHeader}>
                                                <span style={styles.expertIcon}>✨</span>
                                                <h4 style={styles.expertTitle}>AI 아키텍트 전문 가이드</h4>
                                            </div>
                                            <div style={styles.expertBody}>
                                                <p style={styles.expertText}>{selectedHistory.analysisAdvice}</p>
                                            </div>
                                            <div style={styles.expertFooter}>
                                                Verified by Eye-Brow Architect Engine v2.0
                                            </div>
                                        </div>
                                    )}
                                    <div style={styles.gridDetails}>
                                        <div style={styles.detailBlock}>
                                            <label style={styles.detailLabel}>분석된 얼굴형</label>
                                            <div style={styles.detailValueBox}>
                                                <span style={styles.valueIcon}>👤</span>
                                                <span style={styles.detailValue}>{selectedHistory.faceShape}</span>
                                            </div>
                                        </div>
                                        <div style={styles.detailBlock}>
                                            <label style={styles.detailLabel}>대표 눈썹 디자인</label>
                                            <div style={styles.detailValueBox}>
                                                <span style={styles.valueIcon}>📐</span>
                                                <span style={styles.detailValue}>{selectedHistory.recommendedDesign}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={styles.modalFooter}>
                                    <button
                                        onClick={() => {
                                            if (isProcessing) return;
                                            if (!selectedHistory.isLatest) {
                                                setIsProcessing(true);
                                                // 대표 사진이 아니면 설정 후 이동
                                                fetch(`/api/history/${selectedHistory.analysisId}/main?userId=${user.userId}`, { method: 'POST' })
                                                    .then(res => {
                                                        if (res.ok) {
                                                            // 로컬 정보 업데이트
                                                            const updatedUser = {
                                                                ...user,
                                                                faceImageUrl: selectedHistory.imageUrl,
                                                                faceShape: selectedHistory.faceShape,
                                                                eyebrowCoords: selectedHistory.eyebrowCoords
                                                            };
                                                            localStorage.setItem('user', JSON.stringify(updatedUser));
                                                            navigate('/counseling');
                                                        } else {
                                                            alert("대표 사진 설정에 실패했습니다. (서버 오류)");
                                                        }
                                                    })
                                                    .catch(err => {
                                                        console.error("Main Set Error:", err);
                                                        alert("서버와 통신할 수 없습니다. 백엔드 상태를 확인해 주세요.");
                                                    })
                                                    .finally(() => setIsProcessing(false));
                                            } else {
                                                navigate('/counseling');
                                            }
                                        }}
                                        style={{
                                            ...styles.modalActionBtn,
                                            opacity: isProcessing ? 0.7 : 1,
                                            cursor: isProcessing ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? '처리 중...' : (selectedHistory.isLatest ? '새로운 분석 시작하기' : '이 사진을 대표로 설정하고 분석받기 ✨')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Chatbot Toggle */}
            <button
                onClick={() => setShowChatbot(!showChatbot)}
                style={styles.chatbotToggle}
                className="chatbot-fab"
                title="AI 챗봇 상담"
            >
                {showChatbot ? '✕' : '💬'}
            </button>

            {/* Chatbot Modal */}
            <ChatbotModal
                isOpen={showChatbot}
                onClose={() => setShowChatbot(false)}
                user={user}
            />
        </div>
    );
};

const styles = {
    container: { width: '100%', minHeight: '100vh' },
    contentWrapper: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '60px 24px' },
    profileSection: { marginBottom: '80px' },
    profileCard: { display: 'flex', alignItems: 'center', gap: '40px', padding: '40px', backgroundColor: 'var(--bg-card)' },
    avatarOuter: { position: 'relative', width: '120px', height: '120px' },
    avatarImg: { width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '5px solid var(--bg-card)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' },
    statusDot: { position: 'absolute', bottom: '8px', right: '8px', width: '18px', height: '18px', background: '#4cd137', border: '3px solid var(--bg-card)', borderRadius: '50%' },
    userName: { fontSize: '1.75rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' },
    settingsBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s' },
    membershipRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
    tierBadge: { fontSize: '0.65rem', fontWeight: '900', color: 'var(--bg-main)', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em' },
    upgradeLink: { background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', padding: 0 },
    usageContainer: { marginBottom: '20px', width: '220px' },
    usageLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
    usageLabel: { fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' },
    usageCount: { fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)' },
    usageBarBg: { width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' },
    usageBarFill: { height: '100%', transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' },
    userEmail: { fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' },
    userRole: { fontSize: '0.8rem', background: 'var(--border-light)', padding: '4px 12px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', fontWeight: '600' },
    userBio: { color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '450px', lineHeight: 1.6 },
    statGrid: { display: 'flex', gap: '32px', marginTop: '24px' },
    statItem: { display: 'flex', flexDirection: 'column' },
    statVal: { fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' },
    statLabel: { fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' },
    dashboardBtn: {
        marginLeft: 'auto',
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '10px 20px',
        borderRadius: 'var(--radius-md)',
        fontWeight: '700',
        fontSize: '0.85rem',
        cursor: 'pointer',
    },
    section: { marginBottom: '40px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    sectionTitle: { fontSize: '1.5rem', fontWeight: '800' },
    addBtn: { background: 'var(--text-primary)', color: 'var(--bg-main)', padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' },
    uploadZone: { display: 'flex', justifyContent: 'center', marginBottom: '40px' },
    uploadForm: { width: '100%', maxWidth: '500px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
    cameraBox: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
    cameraContainer: { position: 'relative', width: '100%', maxWidth: '350px', background: '#000', borderRadius: '12px', overflow: 'hidden' },
    guideCanvas: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
    },
    videoPreview: { width: '100%', display: 'block', transform: 'scaleX(-1)' },
    cameraControls: { display: 'flex', gap: '10px' },
    captureBtn: { padding: '12px 24px', background: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '700', cursor: 'pointer' },
    cancelCameraBtn: { padding: '12px 24px', background: 'var(--border-light)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '700', cursor: 'pointer' },
    fileInterface: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
    previewImg: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' },
    emptyAvatarPlaceholder: { width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--text-muted)' },
    actionRow: { display: 'flex', gap: '12px' },
    selectorBtn: { padding: '10px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', cursor: 'pointer' },
    submitBtn: { width: '100%', background: 'var(--accent-primary)', color: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)', fontWeight: '700', cursor: 'pointer' },
    historyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' },
    historyCard: {
        backgroundColor: 'var(--bg-card)',
        overflow: 'hidden',
        display: 'flex',
        height: '180px',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        borderRadius: 'var(--radius-md)',
    },
    cardVisual: { flex: '0 0 140px', position: 'relative' },
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
    mainAvatarBadge: {
        position: 'absolute',
        bottom: '-14px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '3px 12px',
        borderRadius: 'var(--radius-full)',
        fontWeight: '900',
        fontSize: '9px',
        boxShadow: 'var(--glass-shadow)',
        border: '3px solid var(--bg-card)',
        whiteSpace: 'nowrap',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainBadgeCorner: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'var(--accent-primary)',
        color: 'var(--bg-main)',
        padding: '4px 10px',
        borderRadius: '6px',
        fontWeight: '900',
        fontSize: '0.65rem',
        boxShadow: 'var(--glass-shadow)',
        zIndex: 2,
        backdropFilter: 'blur(4px)',
        whiteSpace: 'nowrap'
    },
    setMainHoverBtn: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0.9)',
        background: 'var(--glass-bg)',
        color: 'var(--text-primary)',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '800',
        cursor: 'pointer',
        opacity: 0,
        transition: 'all 0.3s ease',
        zIndex: 2,
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
    },
    ribbonText: { textShadow: '0 0 10px rgba(255,255,255,0.5)' },
    cardContent: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' },
    cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
    cardTitle: { fontSize: '1.1rem', fontWeight: '800', margin: 0 },
    cardDate: { fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' },
    cardDetails: { flex: 1 },
    detailRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
    detailTitle: { fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' },
    detailVal: { fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' },
    cardActions: { display: 'flex', gap: '8px', marginTop: '12px' },
    secondaryBtn: { flex: 1, padding: '8px', background: 'var(--border-light)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '700' },
    deleteBtn: { padding: '8px 12px', background: 'transparent', color: '#ff4757', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '700' },
    scrapsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' },
    scrapCard: { backgroundColor: 'var(--bg-card)', overflow: 'hidden' },
    scrapVisual: { height: '160px', position: 'relative', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    scrapImg: { width: '80%', height: '80%', objectFit: 'contain' },
    unsaveBtn: { position: 'absolute', top: '12px', right: '12px', background: 'var(--bg-card)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' },
    scrapContent: { padding: '16px' },
    scrapTitle: { fontSize: '1rem', fontWeight: '800', margin: '0 0 4px 0' },
    scrapDesc: { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' },
    scrapAction: { width: '100%', padding: '8px', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: '700' },
    emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '0.9rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1.5px dashed var(--border-light)' },
    infoIcon: {
        background: 'var(--border-light)',
        color: 'var(--text-secondary)',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        cursor: 'pointer',
        border: 'none',
        transition: 'var(--transition-smooth)'
    },
    tooltipBox: {
        position: 'absolute',
        top: '30px',
        left: '0',
        width: '260px',
        padding: '16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--glass-shadow)',
        zIndex: 100,
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        textAlign: 'left'
    },

    // Modal Styles
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    },
    modalContent: {
        width: '95%', maxWidth: '1200px', maxHeight: '90vh', background: 'var(--bg-card)', borderRadius: '24px',
        position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
    },
    modalClose: {
        position: 'absolute', top: '20px', right: '20px', background: 'var(--border-light)', border: 'none',
        width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer',
        zIndex: 100, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    modalInner: { display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, overflow: 'hidden' },
    modalVisualSide: { flex: 1.5, background: '#1a1a1a', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 },
    modalSimulationBox: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', overflow: 'hidden', background: '#000' },
    modalInfoSide: { flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 },
    modalSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '-10px' },
    modalHeader: { marginBottom: '40px', borderBottom: '1px solid var(--border-light)', paddingBottom: '30px' },
    modalTitle: { fontSize: '2rem', fontWeight: '900', marginBottom: '10px' },
    modalDate: { fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' },
    detailList: { display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '50px' },
    detailBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
    detailLabel: { fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' },
    detailValue: { fontSize: '1.25rem', fontWeight: '700' },
    adviceCard: {
        background: 'linear-gradient(135deg, rgba(97, 218, 251, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        padding: '24px',
        borderRadius: '16px',
        borderLeft: '4px solid var(--accent-primary)',
        marginBottom: '32px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    adviceTitle: {
        fontSize: '0.9rem',
        color: 'var(--accent-primary)',
        margin: '0 0 12px 0',
        fontWeight: '800',
        letterSpacing: '0.05em',
    },
    adviceText: {
        fontSize: '1rem',
        lineHeight: '1.8',
        color: 'var(--text-primary)',
        margin: 0,
        wordBreak: 'keep-all',
    },
    modalActionBtn: {
        width: '100%', padding: '18px', background: 'var(--accent-primary)', color: 'var(--bg-main)',
        border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer',
        transition: 'transform 0.2s ease', boxShadow: '0 10px 20px rgba(97, 218, 251, 0.3)'
    },
    chatbotToggle: {
        position: 'fixed', bottom: '40px', right: '40px',
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'var(--accent-primary)', color: 'var(--bg-main)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', cursor: 'pointer', border: 'none',
        boxShadow: '0 8px 32px rgba(97, 218, 251, 0.4)', zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    viewMoreBtn: {
        background: 'transparent',
        border: '1px solid var(--border-light)',
        color: 'var(--text-secondary)',
        padding: '12px 30px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.85rem',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    consultBadge: {
        fontSize: '0.75rem',
        background: 'rgba(97, 218, 251, 0.1)',
        color: 'var(--accent-primary)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontWeight: '800',
    },
    consultList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    consultItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        padding: '24px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '1px solid var(--border-light)',
    },
    consultDate: {
        fontSize: '0.8rem',
        fontWeight: '700',
        color: 'var(--text-muted)',
        flexShrink: 0,
        width: '90px',
    },
    consultThumbWrapper: {
        width: '60px',
        height: '60px',
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid var(--border-light)',
        background: '#000',
    },
    consultThumb: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    consultContent: {
        flex: 1,
    },
    consultText: {
        fontSize: '1rem',
        fontWeight: '600',
        margin: '0 0 8px 0',
        color: 'var(--text-primary)',
    },
    consultMeta: {
        display: 'flex',
        gap: '12px',
        fontSize: '0.75rem',
        color: 'var(--accent-primary)',
        fontWeight: '700',
    },
    goDetailBtn: {
        cursor: 'pointer',
    },
    // New Premium Report Styles
    consultMainInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
    consultTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    consultBadgePremium: { fontSize: '0.7rem', fontWeight: '900', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(97, 218, 251, 0.1)', padding: '4px 10px', borderRadius: '4px' },
    consultOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', opacity: 0, transition: 'opacity 0.3s ease' },
    tag: { fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)' },
    consultAction: { display: 'flex', alignItems: 'center' },

    expertGuideCard: {
        background: 'linear-gradient(135deg, rgba(97, 218, 251, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
        borderRadius: '20px',
        padding: '24px',
        border: '1px solid rgba(97, 218, 251, 0.2)',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
    },
    expertHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
    expertIcon: { fontSize: '1.4rem' },
    expertTitle: { fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--accent-primary)' },
    expertBody: { background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '14px', marginBottom: '16px' },
    expertText: { fontSize: '1rem', lineHeight: '1.8', color: 'var(--text-primary)', margin: 0, wordBreak: 'keep-all' },
    expertFooter: { fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 },

    gridDetails: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    detailValueBox: { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' },
    valueIcon: { fontSize: '1.2rem', opacity: 0.7 }
};

export default MyPage;
