import React, { useRef, useEffect, useState } from 'react';

const CanvasOverlay = ({ imageSrc, guideSrc, coordinates, opacity = 1, onAdjust }) => {
  const canvasRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const guideImg = new Image();
    let loadedCount = 0;
    const totalToLoad = guideSrc ? 2 : 1;

    const draw = () => {
      const origW = img.width || 400;
      const origH = img.height || 400;

      // 1. Single View (Full Width)
      canvas.width = origW;
      canvas.height = origH;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Helper to draw labels
      const drawLabel = (text, x, y, color = 'rgba(0,0,0,0.6)') => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 140, 30); // Adjusted width
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + 70, y + 15); // Adjusted x position
      };

      // 2. Draw Base Image
      ctx.drawImage(img, 0, 0, origW, origH);
      drawLabel('PRECISION ANALYSIS', 10, 10, 'rgba(255, 87, 87, 0.8)'); // Changed label text and color

      // 3. Draw Coordinates (No more guide image synthesis!)
      if (coordinates) {
        ctx.save();
        ctx.globalAlpha = 1.0; // Coordinates are drawn clearly.

        const baseWidth = Math.max(2, origW * 0.005);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // [1] 얼굴 전체 윤곽선 그리기 (Face Outline)
        const drawFaceOutline = (points) => {
          if (!points || points.length === 0) return;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; // 은은한 흰색 가이드라인
          ctx.lineWidth = baseWidth * 0.7;
          ctx.setLineDash([5, 5]); // 점선 효과

          points.forEach((p, idx) => {
            const px = (p.x * origW) + offset.x;
            const py = (p.y * origH) + offset.y;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]); // 실선으로 복구
        };

        // [2] 눈썹 추천 라인 그리기
        const drawEyebrow = (points) => {
          if (!points || points.length === 0) return;
          ctx.beginPath();
          ctx.strokeStyle = '#61dafb';
          ctx.lineWidth = baseWidth;
          ctx.shadowBlur = baseWidth * 2;
          ctx.shadowColor = 'rgba(97, 218, 251, 1)';

          points.forEach((p, idx) => {
            const px = (p.x * origW) + offset.x;
            const py = (p.y * origH) + offset.y;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
          ctx.shadowBlur = 0;

          // 랜드마크 포인트
          points.forEach((p, idx) => {
            if (idx % 3 === 0 || idx === points.length - 1) {
              const px = (p.x * origW) + offset.x;
              const py = (p.y * origH) + offset.y;
              ctx.fillStyle = '#fff';
              ctx.beginPath();
              ctx.arc(px, py, baseWidth * 0.4, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        };

        const drawEyeliner = (points) => {
          if (!points || points.length === 0) return;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'; // 선명한 딥 블랙
          ctx.lineWidth = baseWidth * 0.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          points.forEach((p, idx) => {
            const px = (p.x * origW) + offset.x;
            const py = (p.y * origH) + offset.y;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        };

        // New nested structure handling
        const eb = coordinates.eyebrows || coordinates;
        const el = coordinates.eyeliner;
        const outline = coordinates.faceOutline;

        if (outline) drawFaceOutline(outline);
        if (el) {
          if (el.left) drawEyeliner(el.left);
          if (el.right) drawEyeliner(el.right);
        }
        if (eb.left) drawEyebrow(eb.left);
        if (eb.right) drawEyebrow(eb.right);

        ctx.restore();
      }
    };

    const handleLoad = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        draw();
      }
    };

    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = handleLoad;

    if (guideSrc) {
      guideImg.crossOrigin = "anonymous";
      guideImg.src = guideSrc;
      guideImg.onload = handleLoad;
    }
  }, [imageSrc, guideSrc, coordinates, opacity, offset]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          borderRadius: '12px'
        }}
      />
    </div>
  );
};

export default CanvasOverlay;