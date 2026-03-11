import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/Header';

const SignupPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        bio: '',
        age: '',
        gender: '',
        profileImage: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState('');

    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const guideCanvasRef = useRef(null);

    useEffect(() => {
        if (showCamera && guideCanvasRef.current && videoRef.current) {
            const canvas = guideCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const video = videoRef.current;

            const drawGuide = () => {
                if (!showCamera || !video.videoWidth) {
                    requestAnimationFrame(drawGuide);
                    return;
                }
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
            const interval = setInterval(drawGuide, 100);
            return () => clearInterval(interval);
        }
    }, [showCamera]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (step < 5) nextStep();
            else handleSubmit();
        }
    };

    const nextStep = () => {
        if (step === 2 && formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (step === 1 && !formData.email) {
            setError('이메일을 입력해 주세요.');
            return;
        }
        setError('');
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profileImage: file }));
            setPreviewUrl(URL.createObjectURL(file));
            setShowCamera(false);
        }
    };

    const startCamera = async () => {
        try {
            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setError('카메라를 활성화할 수 없습니다: ' + err.message);
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
                setFormData(prev => ({ ...prev, profileImage: file }));
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

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            setError('');
            // 1. Signup
            const signupRes = await fetch('/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    nickname: formData.nickname,
                    bio: formData.bio,
                    age: parseInt(formData.age) || 0,
                    gender: formData.gender || 'Other'
                })
            });

            if (!signupRes.ok) {
                const msg = await signupRes.text();
                throw new Error(msg);
            }

            const signupData = await signupRes.text();
            const userIdMatch = signupData.match(/ID: (\d+)/);
            if (!userIdMatch) throw new Error("서버 응답에서 사용자 ID를 찾을 수 없습니다.");
            const userId = userIdMatch[1];

            // 2. Upload photo if exists
            if (formData.profileImage) {
                const photoData = new FormData();
                photoData.append('file', formData.profileImage);
                const uploadRes = await fetch(`/api/users/${userId}/upload-face`, {
                    method: 'POST',
                    body: photoData
                });
                if (!uploadRes.ok) console.error("사진 업로드 실패");
            }

            alert('회원가입이 완료되었습니다!');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="fade-in">
                        <h2 style={styles.stepTitle}>시작해볼까요?</h2>
                        <p style={styles.stepDesc}>먼저, 사용하실 이메일 주소를 입력해 주세요.</p>
                        <input
                            type="email"
                            name="email"
                            placeholder="email@example.com"
                            style={styles.input}
                            value={formData.email}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="fade-in">
                        <h2 style={styles.stepTitle}>보안 설정</h2>
                        <p style={styles.stepDesc}>계정 보호를 위해 강력한 비밀번호를 만들어 주세요.</p>
                        <input
                            type="password"
                            name="password"
                            placeholder="비밀번호"
                            style={styles.input}
                            value={formData.password}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="비밀번호 확인"
                            style={{ ...styles.input, marginTop: '15px' }}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="fade-in">
                        <h2 style={styles.stepTitle}>당신을 알려주세요</h2>
                        <p style={styles.stepDesc}>닉네임을 정하고 짧은 소개글을 남겨주세요.</p>
                        <input
                            type="text"
                            name="nickname"
                            placeholder="닉네임 (예: 뷰티퀸)"
                            style={styles.input}
                            value={formData.nickname}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                        <textarea
                            name="bio"
                            placeholder="나를 표현하는 한 줄 자기소개..."
                            style={{ ...styles.input, marginTop: '15px', height: '80px', resize: 'none' }}
                            value={formData.bio}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                );
            case 4:
                return (
                    <div className="fade-in">
                        <h2 style={styles.stepTitle}>거의 다 왔어요</h2>
                        <p style={styles.stepDesc}>더 정확한 추천을 위해 몇 가지 정보가 더 필요해요.</p>
                        <div style={styles.row}>
                            <input
                                type="number"
                                name="age"
                                placeholder="나이"
                                style={{ ...styles.input, flex: 1 }}
                                value={formData.age}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <select
                                name="gender"
                                style={{ ...styles.input, flex: 1, marginLeft: '10px' }}
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">성별 선택</option>
                                <option value="Male">남성</option>
                                <option value="Female">여성</option>
                                <option value="Other">기타</option>
                            </select>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="fade-in">
                        <h2 style={styles.stepTitle}>마지막 단계예요</h2>
                        <p style={styles.stepDesc}>AI 분석을 위해 얼굴 사진을 등록해 주세요. 촬영하거나 파일을 업로드할 수 있습니다.</p>

                        <div style={styles.uploadContainer}>
                            {showCamera ? (
                                <div style={styles.cameraBox}>
                                    <div style={styles.cameraContainer}>
                                        <video ref={videoRef} autoPlay playsInline style={styles.videoPreview} />
                                        <canvas ref={guideCanvasRef} style={styles.guideCanvas} />
                                    </div>
                                    <div style={styles.cameraControls}>
                                        <button type="button" onClick={capturePhoto} style={styles.captureBtn}>사진 촬영</button>
                                        <button type="button" onClick={stopCamera} style={styles.cancelCameraBtn}>취소</button>
                                    </div>
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                </div>
                            ) : (
                                <div style={styles.uploadZone}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" style={styles.previewImg} />
                                    ) : (
                                        <div style={styles.placeholderIcon}>👤</div>
                                    )}
                                    <div style={styles.actionRow}>
                                        <button type="button" onClick={startCamera} style={styles.actionBtn}>📷 사진 촬영</button>
                                        <label htmlFor="profile-upload" style={styles.actionBtn}>📁 파일 선택</label>
                                    </div>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={styles.container}>
            <GlobalHeader />
            <div style={styles.content}>
                <div style={styles.progressContainer}>
                    <div style={{ ...styles.progressBar, width: `${(step / 5) * 100}%` }}></div>
                </div>

                <div className="glass-panel" style={styles.card}>
                    <div style={styles.stepIndicator}>전체 5단계 중 {step}단계</div>
                    <form onSubmit={(e) => e.preventDefault()}>
                        {renderStep()}

                        {error && <p style={styles.error}>{error}</p>}

                        <div style={styles.footer}>
                            {step > 1 && (
                                <button type="button" onClick={prevStep} style={styles.backBtn}>이전으로</button>
                            )}
                            <div style={{ flex: 1 }}></div>
                            {step < 5 ? (
                                <button type="button" onClick={nextStep} style={styles.nextBtn}>다음으로</button>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={handleSubmit} style={styles.skipBtn}>건너뛰고 완료</button>
                                    <button type="button" onClick={handleSubmit} style={styles.finishBtn}>가입 완료</button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


const styles = {
    container: { width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
    progressContainer: { width: '100%', maxWidth: '500px', height: '6px', background: 'var(--border-light)', borderRadius: '3px', marginBottom: '40px', overflow: 'hidden' },
    progressBar: { height: '100%', background: 'var(--accent-primary)', transition: 'width 0.4s ease' },
    card: { width: '100%', maxWidth: '500px', padding: '50px 40px', position: 'relative' },
    stepIndicator: { fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' },
    stepTitle: { fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.2 },
    stepDesc: { fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '30px' },
    input: { width: '100%', padding: '16px', fontSize: '1rem', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', outline: 'none' },
    row: { display: 'flex', gap: '10px' },
    uploadContainer: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    uploadZone: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' },
    cameraBox: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
    cameraContainer: { position: 'relative', width: '100%', maxWidth: '350px', background: '#000', borderRadius: '12px', overflow: 'hidden' },
    guideCanvas: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
    },
    videoPreview: { width: '100%', display: 'block', transform: 'scaleX(-1)' },
    cameraControls: { display: 'flex', gap: '10px' },
    captureBtn: { padding: '10px 24px', background: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '700', cursor: 'pointer' },
    cancelCameraBtn: { padding: '10px 24px', background: 'var(--border-light)', color: 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '700', cursor: 'pointer' },
    previewImg: { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg-card)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
    placeholderIcon: { width: '150px', height: '150px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--text-muted)' },
    actionRow: { display: 'flex', gap: '12px', marginTop: '10px' },
    actionBtn: { padding: '12px 20px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' },
    footer: { display: 'flex', marginTop: '40px', alignItems: 'center' },
    backBtn: { background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' },
    nextBtn: { padding: '14px 32px', background: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' },
    finishBtn: { padding: '14px 32px', background: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: '800', cursor: 'pointer' },
    skipBtn: { padding: '14px 20px', background: 'none', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontWeight: '700', cursor: 'pointer' },
    error: { color: '#ff4757', fontSize: '0.85rem', marginTop: '15px', fontWeight: '600' }
};

export default SignupPage;
